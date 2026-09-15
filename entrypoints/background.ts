import {
  PAGE_STATE,
  SIDE_PANEL_PORT,
  TELL_REMOTE,
  isRestricted,
} from "@/utils/side-panel";
import { browser } from "wxt/browser";
import { defineBackground } from "wxt/utils/define-background";

const HELP_URL = "https://joshuasalazar.me/";
const SIDE_PANEL_PATH = "sidepanel.html";

/** Chrome only, and absent before 114, so it is reached structurally rather than through
 *  the polyfill. Firefox builds get a sidebar the user opens themselves. */
type SidePanelApi = {
  setOptions: (o: {
    tabId: number;
    path?: string;
    enabled: boolean;
  }) => Promise<void>;
  open: (o: { tabId: number }) => Promise<void>;
};

const sidePanel = (
  globalThis as unknown as { chrome?: { sidePanel?: SidePanelApi } }
).chrome?.sidePanel;

/**
 * Chrome only accepts this while the click that asked for it is still in hand, and the
 * gesture does not survive an await — so open() is called first with nothing awaited
 * ahead of it. The manifest's default_path already registers the page.
 */
const openSidePanel = (tabId?: number) => {
  if (!sidePanel || tabId == null) return;
  sidePanel
    .open({ tabId })
    .catch((reason: unknown) =>
      console.warn("Matchup: couldn’t open the side panel", reason),
    );
};

/** Disabling is the only way to close a side panel; re-enabling straight after leaves it
 *  shut but openable, which keeps the gesture-sensitive open() above free of setup. */
const closeSidePanel = async () => {
  if (!sidePanel) return;
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (tab?.id == null) return;
  await sidePanel.setOptions({ tabId: tab.id, enabled: false });
  await sidePanel.setOptions({
    tabId: tab.id,
    path: SIDE_PANEL_PATH,
    enabled: true,
  });
};

/** Tabs where Matchup is actually running. The flag itself lives in each page's own
 *  sessionStorage, so this is the only place the side panel can learn it from. */
const liveTabs = new Set<number>();
/** Each open side panel and the tab it is currently speaking for. Held here because the
 *  background outlives both the panel and any page in it, and a side panel's port keeps
 *  it awake. Which tabs a panel is showing is read back off this rather than tracked
 *  alongside it, so the two can't disagree. */
const panelPorts = new Map<Browser.runtime.Port, number | undefined>();

const hasPanel = (tabId: number) => [...panelPorts.values()].includes(tabId);

const tellPanels = (tabId: number, extra?: { needsReload?: boolean }) => {
  for (const [port, watching] of panelPorts) {
    if (watching !== tabId) continue;
    port.postMessage({ open: liveTabs.has(tabId), ...extra });
  }
};

const tellTab = (tabId: number) => {
  void browser.tabs
    .sendMessage(tabId, { type: TELL_REMOTE, remote: hasPanel(tabId) })
    .catch(() => undefined);
};

export default defineBackground(() => {
  // Only extension pages may open the options page, so the panel asks us to.
  browser.runtime.onMessage.addListener((message: unknown, sender) => {
    const type = (message as { type?: string })?.type;
    if (type === "matchup:open-settings") {
      void browser.runtime.openOptionsPage();
    } else if (type === "matchup:open-help") {
      void browser.tabs.create({ url: HELP_URL });
    } else if (type === "matchup:open-side-panel") {
      openSidePanel(sender.tab?.id);
    } else if (type === "matchup:close-side-panel") {
      void closeSidePanel();
    } else if (type === PAGE_STATE) {
      // Announced by every content script as it mounts, which is what survives a
      // refresh. Answered by pushing rather than replying: `browser` here is Chrome's
      // own API, where returning a promise from onMessage does nothing, and the page
      // is already listening for the push anyway.
      const tabId = sender.tab?.id;
      if (tabId == null) return;
      const open = (message as { open?: boolean }).open === true;
      if (open) liveTabs.add(tabId);
      else liveTabs.delete(tabId);
      tellTab(tabId);
      tellPanels(tabId);
    }
  });

  browser.runtime.onConnect.addListener((port) => {
    if (port.name !== SIDE_PANEL_PORT) return;
    // One side panel serves a window, so the tab it speaks for changes as tabs do.
    let watching: number | undefined;
    const release = () => {
      if (watching == null) return;
      const released = watching;
      watching = undefined;
      // Cleared before the page is told, so `hasPanel` no longer counts this port.
      panelPorts.set(port, undefined);
      tellTab(released);
    };
    panelPorts.set(port, undefined);

    port.onMessage.addListener((message: unknown) => {
      const request = message as {
        tabId?: number;
        openPage?: boolean;
        reloadPage?: boolean;
      };

      if (typeof request.tabId === "number" && request.tabId !== watching) {
        release();
        watching = request.tabId;
        panelPorts.set(port, watching);
        tellTab(watching);
        tellPanels(watching);
        return;
      }
      if (watching == null) return;
      if (request.reloadPage) {
        void browser.tabs.reload(watching);
        return;
      }
      if (request.openPage) {
        // The page owns the flag, so it is asked rather than told about; a rejection
        // means no content script is there to ask, which only a reload fixes.
        const target = watching;
        void browser.tabs
          .sendMessage(target, { type: "matchup:toggle", open: true })
          .catch(() => tellPanels(target, { needsReload: true }));
      }
    });

    port.onDisconnect.addListener(() => {
      release();
      panelPorts.delete(port);
    });
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status !== "loading") return;
    liveTabs.delete(tabId);
    tellPanels(tabId);
  });

  browser.tabs.onRemoved.addListener((tabId) => {
    liveTabs.delete(tabId);
  });

  // No popup: the icon toggles the panel straight away, and again to close it.
  browser.action.onClicked.addListener(async (tab) => {
    if (!tab.id || !tab.url || isRestricted(tab.url)) return;
    try {
      await browser.tabs.sendMessage(tab.id, { type: "matchup:toggle" });
    } catch {
      // The content script isn't in this tab yet — it only injects on load.
      await browser.action.setBadgeText({ tabId: tab.id, text: "!" });
      await browser.action.setTitle({
        tabId: tab.id,
        title: "Matchup — reload this page once, then try again",
      });
      setTimeout(() => {
        void browser.action.setBadgeText({ tabId: tab.id!, text: "" });
        void browser.action.setTitle({ tabId: tab.id!, title: "Matchup" });
      }, 4000);
    }
  });
});

import { ASK_REMOTE, SIDE_PANEL_PORT, TELL_REMOTE } from "@/utils/side-panel";
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

/** Tabs a side panel is currently showing. Held here because the background outlives
 *  both the panel and any page in it, and a side panel's port keeps it awake. */
const panelTabs = new Set<number>();

const tellTab = (tabId: number) => {
  void browser.tabs
    .sendMessage(tabId, { type: TELL_REMOTE, remote: panelTabs.has(tabId) })
    .catch(() => undefined);
};

/** Pages where content scripts can't run, so there is nothing to toggle. */
const RESTRICTED = [
  "about:",
  "chrome:",
  "edge:",
  "chrome-extension:",
  "https://chromewebstore.google.com",
];

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
    } else if (type === ASK_REMOTE) {
      // Announced by every content script as it mounts, which is what survives a
      // refresh. Answered by pushing rather than replying: `browser` here is Chrome's
      // own API, where returning a promise from onMessage does nothing, and the page
      // is already listening for the push anyway.
      const tabId = sender.tab?.id;
      if (tabId != null) tellTab(tabId);
    }
  });

  browser.runtime.onConnect.addListener((port) => {
    if (port.name !== SIDE_PANEL_PORT) return;
    // One side panel serves a window, so the tab it speaks for changes as tabs do.
    let watching: number | undefined;
    const release = () => {
      if (watching == null) return;
      panelTabs.delete(watching);
      tellTab(watching);
      watching = undefined;
    };
    port.onMessage.addListener((message: unknown) => {
      const tabId = (message as { tabId?: number })?.tabId;
      if (typeof tabId !== "number" || tabId === watching) return;
      release();
      watching = tabId;
      panelTabs.add(tabId);
      tellTab(tabId);
    });
    port.onDisconnect.addListener(release);
  });

  // No popup: the icon toggles the panel straight away, and again to close it.
  browser.action.onClicked.addListener(async (tab) => {
    if (
      !tab.id ||
      !tab.url ||
      RESTRICTED.some((prefix) => tab.url!.startsWith(prefix))
    )
      return;
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

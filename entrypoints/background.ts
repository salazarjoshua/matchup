import {
  PANEL_TAB_PARAM,
  PAGE_QUERY,
  PAGE_STATE,
  SIDE_PANEL_PORT,
  TELL_REMOTE,
  isRestricted,
} from "@/utils/side-panel";
import { browser } from "wxt/browser";
import { defineBackground } from "wxt/utils/define-background";

/** Chrome only, and absent before 114, so it is reached structurally rather than through
 *  the polyfill. Firefox builds get a sidebar the user opens themselves. */
type SidePanelApi = {
  open: (o: { tabId: number }) => Promise<void>;
  setOptions: (o: {
    tabId?: number;
    path?: string;
    enabled?: boolean;
  }) => Promise<void>;
};

const sidePanel = (
  globalThis as unknown as { chrome?: { sidePanel?: SidePanelApi } }
).chrome?.sidePanel;

/**
 * Chrome only accepts this while the click that asked for it is still in hand, and the
 * gesture does not survive an await — so open() is called with nothing awaited ahead of
 * it. setOptions isn't awaited either: Chrome applies the two calls in order.
 *
 * A panel of this tab's own, rather than the window-wide default, so it stays with the
 * page it was opened on and Chrome hides it on every other tab. The tab id rides in the
 * path because that is the only thing the panel's document is sure to be handed.
 */
const openSidePanel = (tabId?: number) => {
  if (!sidePanel || tabId == null) return;
  const warn = (reason: unknown) =>
    console.warn("Matchup: couldn’t open the side panel", reason);
  sidePanel
    .setOptions({
      tabId,
      path: `sidepanel.html?${PANEL_TAB_PARAM}=${tabId}`,
      enabled: true,
    })
    .catch(warn);
  sidePanel.open({ tabId }).catch(warn);
};

/** Each open side panel and the tab it is currently speaking for. Rebuilt whenever the
 *  worker is: a panel reconnects on its own and says again which tab it is showing. */
const panelPorts = new Map<Browser.runtime.Port, number | undefined>();

const hasPanel = (tabId: number) => [...panelPorts.values()].includes(tabId);

const tellPanels = (
  tabId: number,
  open: boolean,
  extra?: { needsReload?: boolean; turnedOff?: boolean },
) => {
  for (const [port, watching] of panelPorts) {
    if (watching !== tabId) continue;
    port.postMessage({ open, ...extra });
  }
};

/**
 * Asked of the page every time rather than remembered here. Chrome recycles this worker
 * after half a minute idle — an open port does not keep it awake — and a copy held in
 * memory went with it, so a panel that reconnected was told Matchup was off while the
 * overlay sat right there. A rejection means no content script to ask.
 */
const syncPanels = (tabId: number) => {
  void browser.tabs
    .sendMessage(tabId, { type: PAGE_QUERY })
    .then((reply) =>
      tellPanels(tabId, (reply as { open?: boolean })?.open === true),
    )
    .catch(() => tellPanels(tabId, false));
};

const tellTab = (tabId: number) => {
  void browser.tabs
    .sendMessage(tabId, { type: TELL_REMOTE, remote: hasPanel(tabId) })
    .catch(() => undefined);
};

/**
 * The content script only injects on load, so a tab already open when Matchup was
 * installed or updated has none. Added then rather than to every open tab up front, so
 * a page is only touched once Matchup is asked for there. Rejects where the browser
 * won't let anything in — its own pages, the extension stores.
 */
const toggleTab = async (tabId: number, open?: boolean) => {
  const message = { type: "matchup:toggle", open };
  try {
    await browser.tabs.sendMessage(tabId, message);
  } catch {
    await browser.scripting.executeScript({
      target: { tabId },
      files: ["/content-scripts/content.js"],
    });
    await browser.tabs.sendMessage(tabId, message);
  }
};

export default defineBackground(() => {
  // The manifest's default_path would open one panel for the whole window, following
  // whichever tab is active. Every panel is opened per tab instead, above.
  void sidePanel?.setOptions({ enabled: false }).catch(() => undefined);

  // Only extension pages may open the options page, so the panel asks us to.
  browser.runtime.onMessage.addListener((message: unknown, sender) => {
    const type = (message as { type?: string })?.type;
    if (type === "matchup:open-settings") {
      void browser.runtime.openOptionsPage();
    } else if (type === "matchup:open-side-panel") {
      openSidePanel(sender.tab?.id);
    } else if (type === PAGE_STATE) {
      // Announced by every content script as it mounts, which is what survives a
      // refresh. Answered by pushing rather than replying: `browser` here is Chrome's
      // own API, where returning a promise from onMessage does nothing, and the page
      // is already listening for the push anyway.
      const tabId = sender.tab?.id;
      if (tabId == null) return;
      const open = (message as { open?: boolean }).open === true;
      tellTab(tabId);
      // Only the toolbar icon turns Matchup off, and a side panel left open on a page
      // with nothing to drive is one more thing to close by hand.
      tellPanels(tabId, open, open ? undefined : { turnedOff: true });
    }
  });

  browser.runtime.onConnect.addListener((port) => {
    if (port.name !== SIDE_PANEL_PORT) return;
    // Chrome's panel names its tab once. Firefox's sidebar serves a window, so the tab
    // it speaks for changes as tabs do.
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
        syncPanels(watching);
        return;
      }
      if (watching == null) return;
      if (request.reloadPage) {
        void browser.tabs.reload(watching);
        return;
      }
      if (request.openPage) {
        // The page owns the flag, so it is asked rather than told about; a rejection
        // means not even injecting got Matchup in, and a reload is all that's left.
        const target = watching;
        void toggleTab(target, true).catch(() =>
          tellPanels(target, false, { needsReload: true }),
        );
      }
    });

    port.onDisconnect.addListener(() => {
      release();
      panelPorts.delete(port);
    });
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    // Asked rather than assumed off: a single-page app reports "loading" on its own
    // route changes, and the content script there never remounts to say it is still on.
    if (changeInfo.status !== "loading" || !hasPanel(tabId)) return;
    syncPanels(tabId);
  });

  // No popup: the icon toggles the panel straight away, and again to close it.
  browser.action.onClicked.addListener(async (tab) => {
    const tabId = tab.id;
    if (!tabId || !tab.url || isRestricted(tab.url)) return;
    try {
      await toggleTab(tabId);
    } catch {
      // Not even injecting got Matchup into this tab.
      await browser.action.setBadgeText({ tabId, text: "!" });
      await browser.action.setTitle({
        tabId,
        title: "Matchup — reload this page once, then try again",
      });
      setTimeout(() => {
        void browser.action.setBadgeText({ tabId, text: "" });
        void browser.action.setTitle({ tabId, title: "Matchup" });
      }, 4000);
    }
  });
});

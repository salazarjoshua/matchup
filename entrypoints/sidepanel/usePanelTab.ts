import { PANEL_TAB_PARAM, isRestricted } from "@/utils/side-panel";
import { useEffect, useState } from "react";
import { browser } from "wxt/browser";

export type PanelTab = {
  id: number;
  origin: string;
  /** Matchup runs no content script here, so there is nothing to turn on. */
  restricted: boolean;
};

/** Set by the background when it opens a side panel for one tab. */
const OWN_TAB_ID =
  Number(new URLSearchParams(location.search).get(PANEL_TAB_PARAM)) ||
  undefined;

const read = async (): Promise<PanelTab | undefined> => {
  const tab =
    OWN_TAB_ID != null
      ? await browser.tabs.get(OWN_TAB_ID).catch(() => undefined)
      : (await browser.tabs.query({ active: true, currentWindow: true }))[0];
  if (tab?.id == null) return undefined;
  // No url is how a page Matchup has no access to shows, chrome:// ones among them.
  if (!tab.url || isRestricted(tab.url))
    return { id: tab.id, origin: "", restricted: true };
  try {
    return { id: tab.id, origin: new URL(tab.url).origin, restricted: false };
  } catch {
    return undefined;
  }
};

/**
 * Which page the panel is speaking for. In Chrome that is the tab it was opened on, for
 * the document's whole life: the panel belongs to that page, and Chrome hides it on the
 * others. Firefox's sidebar can't be tied to a tab, so it still follows the active one,
 * and switching tabs swaps the layers underneath it. In both, a navigation in the tab
 * being shown swaps them too.
 */
export const usePanelTab = () => {
  const [tab, setTab] = useState<PanelTab>();

  useEffect(() => {
    let live = true;
    const sync = () => {
      void read().then((next) => {
        if (!live) return;
        setTab((current) =>
          current?.id === next?.id &&
          current?.origin === next?.origin &&
          current?.restricted === next?.restricted
            ? current
            : next,
        );
      });
    };
    sync();
    // onUpdated fires for every tab in the window and for title and favicon changes
    // alike. Only a navigation in the tab being shown can change the answer. "loading"
    // as well as the url, which isn't reported for a page Matchup has no access to.
    const onUpdated = (
      tabId: number,
      changeInfo: { url?: string; status?: string },
      updated: { active?: boolean },
    ) => {
      if (!changeInfo.url && changeInfo.status !== "loading") return;
      if (OWN_TAB_ID != null ? tabId !== OWN_TAB_ID : !updated.active)
        return;
      sync();
    };
    browser.tabs.onUpdated.addListener(onUpdated);
    if (OWN_TAB_ID == null) browser.tabs.onActivated.addListener(sync);
    return () => {
      live = false;
      browser.tabs.onUpdated.removeListener(onUpdated);
      browser.tabs.onActivated.removeListener(sync);
    };
  }, []);

  return tab;
};

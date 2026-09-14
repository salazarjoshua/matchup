import { isRestricted } from "@/utils/side-panel";
import { useEffect, useState } from "react";
import { browser } from "wxt/browser";

export type ActiveTab = {
  id: number;
  origin: string;
  host: string;
  /** Matchup runs no content script here, so there is nothing to turn on. */
  restricted: boolean;
};

const read = async (): Promise<ActiveTab | undefined> => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (tab?.id == null || !tab.url) return undefined;
  if (isRestricted(tab.url))
    return { id: tab.id, origin: "", host: "", restricted: true };
  try {
    const url = new URL(tab.url);
    return {
      id: tab.id,
      origin: url.origin,
      host: url.host,
      restricted: false,
    };
  } catch {
    return undefined;
  }
};

/**
 * Which page the panel is speaking for. One side panel serves a whole window, so it has
 * to follow the tab: switching tabs or navigating swaps the layers underneath it.
 */
export const useActiveTab = () => {
  const [tab, setTab] = useState<ActiveTab>();

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
    // alike. Only a navigation in the tab being shown can change the answer.
    const onUpdated = (
      tabId: number,
      changeInfo: { url?: string },
      updated: { active?: boolean },
    ) => {
      if (!changeInfo.url || !updated.active) return;
      sync();
    };
    browser.tabs.onActivated.addListener(sync);
    browser.tabs.onUpdated.addListener(onUpdated);
    return () => {
      live = false;
      browser.tabs.onActivated.removeListener(sync);
      browser.tabs.onUpdated.removeListener(onUpdated);
    };
  }, []);

  return tab;
};

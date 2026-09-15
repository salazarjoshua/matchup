import { MatchupPanel } from "@/components/matchup/MatchupPanel";
import { SidePanelPrompt } from "@/components/matchup/SidePanelPrompt";
import { SIDE_PANEL_PORT } from "@/utils/side-panel";
import { useMatchupSettings, useMatchupStore } from "@/utils/use-matchup-store";
import { useActiveTab } from "./useActiveTab";
import { useEffect, useRef, useState } from "react";
import { browser } from "wxt/browser";

export default function App() {
  const tab = useActiveTab();
  const prefs = useMatchupSettings();
  /** Whether Matchup is running on the tab being shown. Editing layers for a page that
   *  is not listening would draw nothing, so the panel offers to turn it on instead. */
  const [page, setPage] = useState<{ open: boolean; needsReload?: boolean }>({
    open: false,
  });
  const { hydrated, panelProps } = useMatchupStore(
    page.open ? tab?.origin : undefined,
    prefs,
  );

  const port = useRef<ReturnType<typeof browser.runtime.connect>>(undefined);
  const watching = useRef<number>(undefined);

  /**
   * Registers with the background for as long as this panel is open. Only the tab being
   * shown travels down it — closing the panel drops the port, which is how the page is
   * told to take its own panel back.
   */
  useEffect(() => {
    let live = true;
    const connect = () => {
      if (!live) return;
      const next = browser.runtime.connect({ name: SIDE_PANEL_PORT });
      port.current = next;
      // The worker is recycled freely; without this the page would be left thinking
      // no side panel is open.
      next.onMessage.addListener((message: unknown) => {
        const state = message as { open?: boolean; needsReload?: boolean };
        setPage({
          open: state.open === true,
          needsReload: state.needsReload === true,
        });
      });
      next.onDisconnect.addListener(() => {
        port.current = undefined;
        if (live) setTimeout(connect, 250);
      });
      if (watching.current != null)
        next.postMessage({ tabId: watching.current });
    };
    connect();
    return () => {
      live = false;
      port.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (tab?.id == null) return;
    watching.current = tab.id;
    port.current?.postMessage({ tabId: tab.id });
  }, [tab?.id]);

  /**
   * A side panel closes itself. Asking the background to disable it for the tab was the
   * long way round and never shut it on the first click: the disable and the re-enable
   * that keeps it openable land in the same turn, so the panel is on again before Chrome
   * has torn it down. Dropping this document drops the port, which is what tells the page
   * to take its own panel back.
   */
  const close = () => window.close();

  if (!tab || tab.restricted || !page.open) {
    return (
      <div className="font-sans bg-canvas">
        <SidePanelPrompt
          restricted={!tab || tab.restricted}
          needsReload={page.needsReload}
          onOpenPage={() => port.current?.postMessage({ openPage: true })}
          onReload={() => port.current?.postMessage({ reloadPage: true })}
          onClose={close}
        />
      </div>
    );
  }

  return (
    <div className="font-sans bg-canvas min-h-screen p-2">
      {hydrated && (
        <MatchupPanel
          {...panelProps}
          floating={false}
          panelOpen
          onToggleSidePanel={close}
        />
      )}
    </div>
  );
}

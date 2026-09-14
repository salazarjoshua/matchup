import { MatchupPanel, SidePanelPrompt } from "@/components/matchup";
import { ACCEPTED_TYPES } from "@/utils/matchup-state";
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
  const {
    state,
    setState,
    layers,
    selected,
    settings,
    hydrated,
    error,
    setError,
    patch,
    patchLayer,
    addFiles,
    deleteLayer,
    pasteFromClipboard,
  } = useMatchupStore(page.open ? tab?.origin : undefined, prefs.layerDefaults);
  const [renamingId, setRenamingId] = useState<string>();
  const fileInput = useRef<HTMLInputElement>(null);

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

  const close = () =>
    void browser.runtime.sendMessage({ type: "matchup:close-side-panel" });

  if (!tab || tab.restricted || !page.open) {
    return (
      <div className="font-sans bg-canvas">
        <SidePanelPrompt
          host={tab?.host}
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
      <input
        ref={fileInput}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        hidden
        onChange={(event) => {
          void addFiles(Array.from(event.currentTarget.files ?? []));
          event.currentTarget.value = "";
        }}
      />

      {hydrated && (
        <MatchupPanel
          floating={false}
          panelOpen
          shortcuts={prefs.shortcuts}
          layers={layers}
          selectedId={state.selectedId}
          renamingId={renamingId}
          visible={settings.visible}
          locked={settings.locked}
          difference={settings.difference}
          pinned={settings.pinned}
          opacity={settings.opacity}
          anchor={settings.anchor}
          x={settings.x}
          y={settings.y}
          scale={settings.scale}
          error={error}
          hasSelection={Boolean(selected)}
          onToggleSidePanel={close}
          onOpenSettings={() =>
            void browser.runtime.sendMessage({ type: "matchup:open-settings" })
          }
          onOpenHelp={() =>
            void browser.runtime.sendMessage({ type: "matchup:open-help" })
          }
          onToggleVisible={() => patchLayer({ visible: !settings.visible })}
          onToggleLocked={() => patchLayer({ locked: !settings.locked })}
          onToggleDifference={() =>
            patchLayer({ difference: !settings.difference })
          }
          // Only the flag: the page converts the coordinates on the way through,
          // because it is the only side that knows how far it is scrolled.
          onPinnedChange={(pinned) => patchLayer({ pinned })}
          onOpacityChange={(opacity) => patchLayer({ opacity })}
          onAnchorSelect={(index) =>
            patchLayer({ anchor: settings.anchor === index ? null : index })
          }
          onUpload={() => fileInput.current?.click()}
          onPaste={() => void pasteFromClipboard()}
          onDropFiles={(files) => void addFiles(files)}
          onDismissError={() => setError(undefined)}
          onSelectLayer={(id) => patch({ selectedId: id })}
          onStartRename={setRenamingId}
          onRenameLayer={(id, name) => {
            patch({
              layers: state.layers.map((layer) =>
                layer.id === id ? { ...layer, name } : layer,
              ),
            });
            setRenamingId(undefined);
          }}
          onReorderLayers={(fromId, toId, before) =>
            setState((current) => {
              const from = current.layers.findIndex((l) => l.id === fromId);
              const target = current.layers.findIndex((l) => l.id === toId);
              if (from < 0 || target < 0 || from === target) return current;
              const next = [...current.layers];
              const [moved] = next.splice(from, 1);
              if (!moved) return current;
              const at = from < target ? target - 1 : target;
              next.splice(before ? at : at + 1, 0, moved);
              return { ...current, layers: next };
            })
          }
          onDeleteLayer={deleteLayer}
          onXChange={(x) => patchLayer({ x })}
          onYChange={(y) => patchLayer({ y })}
          onScaleChange={(scale) => patchLayer({ scale })}
        />
      )}
    </div>
  );
}

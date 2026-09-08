import Overlay from "@/components/Overlay";
import { MatchupPanel } from "@/components/matchup";
import {
  ACCEPTED_TYPES,
  LAYERS_PER_PAGE,
  LAYER_DEFAULTS,
  MATCHUP_DEFAULTS,
  MAX_LAYERS,
  matchupState,
} from "@/utils/matchup-state";
import { useCallback, useEffect, useRef, useState } from "react";
import { browser } from "wxt/browser";
import type { LayerSettings, MatchupState } from "@/utils/matchup-state";
import type { PointerEvent as ReactPointerEvent } from "react";

const SAVE_DEBOUNCE_MS = 300;
const RAIL_WIDTH = 64;
const PANEL_WIDTH = 320;
const GAP = 12;
const EDGE = 8;
const RAIL_MIN_VISIBLE = 120;

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export default function MatchupApp() {
  const [state, setState] = useState<MatchupState>(MATCHUP_DEFAULTS);
  const [renamingId, setRenamingId] = useState<string>();
  const [error, setError] = useState<string>();
  const [hydrated, setHydrated] = useState(false);
  const [viewport, setViewport] = useState({
    w: window.innerWidth,
    h: window.innerHeight,
  });

  const fileInput = useRef<HTMLInputElement>(null);
  const dragOffset = useRef<{ dx: number; dy: number } | null>(null);

  const patch = useCallback(
    (next: Partial<MatchupState>) =>
      setState((current) => ({ ...current, ...next })),
    [],
  );

  /** Settings live on the layer, so every edit targets the selected one. */
  const patchLayer = useCallback(
    (next: Partial<LayerSettings>) =>
      setState((current) => ({
        ...current,
        layers: current.layers.map((layer) =>
          layer.id === current.selectedId ? { ...layer, ...next } : layer,
        ),
      })),
    [],
  );

  useEffect(() => {
    matchupState
      .getValue()
      .then((stored) => setState({ ...MATCHUP_DEFAULTS, ...stored }))
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  // Debounced so dragging the opacity bar doesn't hammer storage.
  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      matchupState
        .setValue(state)
        .catch(() =>
          setError(
            "Ran out of extension storage. Delete a layer and try again.",
          ),
        );
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [state, hydrated]);

  useEffect(() => {
    const onResize = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const addFiles = useCallback(async (files: File[]) => {
    const rejected = files.find((file) => !ACCEPTED_TYPES.includes(file.type));
    if (rejected) {
      setError(
        `${rejected.name || "That file"} isn’t supported. Use PNG, JPG, WebP or SVG.`,
      );
      return;
    }
    setError(undefined);
    const decoded = await Promise.all(
      files.map(async (file) => ({
        ...LAYER_DEFAULTS,
        id: crypto.randomUUID(),
        name: file.name || "pasted.png",
        src: await readAsDataUrl(file),
      })),
    );
    setState((current) => {
      const added = decoded.slice(0, MAX_LAYERS - current.layers.length);
      if (added.length === 0) {
        setError(
          `Matchup holds ${MAX_LAYERS} layers. Delete one to add another.`,
        );
        return current;
      }
      return {
        ...current,
        layers: [...current.layers, ...added],
        selectedId: current.selectedId ?? added[0]?.id,
      };
    });
  }, []);

  const pasteFromClipboard = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      const files: File[] = [];
      for (const item of items) {
        const type = item.types.find((candidate) =>
          ACCEPTED_TYPES.includes(candidate),
        );
        if (!type) continue;
        files.push(
          new File([await item.getType(type)], `pasted.${type.split("/")[1]}`, {
            type,
          }),
        );
      }
      if (files.length === 0) {
        setError("No image on the clipboard.");
        return;
      }
      await addFiles(files);
    } catch {
      setError("Couldn’t read the clipboard. Press ⌘V over the page instead.");
    }
  }, [addFiles]);

  useEffect(() => {
    const onMessage = (message: unknown) => {
      if ((message as { type?: string })?.type === "matchup:toggle") {
        setState((current) => ({ ...current, open: !current.open }));
      }
    };
    browser.runtime.onMessage.addListener(onMessage);
    return () => browser.runtime.onMessage.removeListener(onMessage);
  }, []);

  const open = state.open;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === "v") patchLayer({ visible: !selectedRef.current?.visible });
      else if (key === "l")
        patchLayer({ locked: !selectedRef.current?.locked });
      else if (key === "d")
        patchLayer({ difference: !selectedRef.current?.difference });
      else if (event.key === "[")
        setState((c) => ({ ...c, page: Math.max(1, c.page - 1) }));
      else if (event.key === "]") setState((c) => ({ ...c, page: c.page + 1 }));
      else return;
      event.preventDefault();
    };
    const onPaste = (event: ClipboardEvent) => {
      const files = Array.from(event.clipboardData?.files ?? []);
      if (files.length > 0) {
        event.preventDefault();
        void addFiles(files);
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("paste", onPaste, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("paste", onPaste, true);
    };
  }, [open, addFiles, patchLayer]);

  const selected = state.layers.find((layer) => layer.id === state.selectedId);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  // Devtools opening shrinks the viewport, which can strand the rail off-screen.
  // Only the rail is pinned inside the edges — the panel flips to whichever side fits.
  const railLeft = Math.max(
    EDGE,
    Math.min(state.origin.left, viewport.w - RAIL_WIDTH - EDGE),
  );
  const railTop = Math.max(
    EDGE,
    Math.min(state.origin.top, viewport.h - RAIL_MIN_VISIBLE),
  );

  const roomRight = viewport.w - (railLeft + RAIL_WIDTH) - GAP - EDGE;
  const roomLeft = railLeft - GAP - EDGE;
  const panelOnLeft = roomRight < PANEL_WIDTH && roomLeft >= PANEL_WIDTH;

  // Anchoring by the right edge keeps the rail put while the panel grows leftward.
  const anchorStyle = panelOnLeft
    ? { right: viewport.w - (railLeft + RAIL_WIDTH) }
    : { left: railLeft };

  const onGripPointerDown = (event: ReactPointerEvent) => {
    dragOffset.current = {
      dx: event.clientX - railLeft,
      dy: event.clientY - railTop,
    };
    const onMove = (move: PointerEvent) => {
      if (!dragOffset.current) return;
      patch({
        origin: {
          left: move.clientX - dragOffset.current.dx,
          top: move.clientY - dragOffset.current.dy,
        },
      });
    };
    const onUp = () => {
      dragOffset.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  if (!hydrated || !open) return null;

  const settings: LayerSettings = selected ?? LAYER_DEFAULTS;
  const pageCount = Math.max(
    1,
    Math.ceil(state.layers.length / LAYERS_PER_PAGE),
  );

  return (
    <>
      {selected?.src && settings.visible && (
        <Overlay
          src={selected.src}
          anchor={settings.anchor}
          x={Number(settings.x) || 0}
          y={Number(settings.y) || 0}
          scale={Number(settings.scale) || 1}
          opacity={settings.opacity}
          difference={settings.difference}
        />
      )}

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

      <div
        style={{
          position: "fixed",
          top: railTop,
          zIndex: 2147483647,
          ...anchorStyle,
        }}
      >
        <MatchupPanel
          layers={state.layers}
          selectedId={state.selectedId}
          renamingId={renamingId}
          visible={settings.visible}
          locked={settings.locked}
          difference={settings.difference}
          opacity={settings.opacity}
          anchor={settings.anchor}
          x={settings.x}
          y={settings.y}
          scale={settings.scale}
          page={Math.min(state.page, pageCount)}
          error={error}
          collapsed={!state.panelOpen}
          panelOnLeft={panelOnLeft}
          hasSelection={Boolean(selected)}
          onTogglePanel={() => patch({ panelOpen: !state.panelOpen })}
          onToggleVisible={() => patchLayer({ visible: !settings.visible })}
          onToggleLocked={() => patchLayer({ locked: !settings.locked })}
          onToggleDifference={() =>
            patchLayer({ difference: !settings.difference })
          }
          onOpacityChange={(opacity) => patchLayer({ opacity })}
          onAnchorSelect={(index) =>
            patchLayer({ anchor: settings.anchor === index ? null : index })
          }
          onPageChange={(next) =>
            patch({ page: Math.min(Math.max(1, next), pageCount) })
          }
          onUpload={() => fileInput.current?.click()}
          onPaste={() => void pasteFromClipboard()}
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
          onDeleteLayer={(id) => {
            const remaining = state.layers.filter((layer) => layer.id !== id);
            patch({
              layers: remaining,
              selectedId:
                state.selectedId === id ? remaining[0]?.id : state.selectedId,
            });
          }}
          onXChange={(x) => patchLayer({ x })}
          onYChange={(y) => patchLayer({ y })}
          onScaleChange={(scale) => patchLayer({ scale })}
          onGripPointerDown={onGripPointerDown}
        />
      </div>
    </>
  );
}

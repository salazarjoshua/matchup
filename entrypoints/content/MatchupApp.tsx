import Overlay from "@/components/Overlay";
import { MatchupPanel } from "@/components/matchup";
import {
  ACCEPTED_TYPES,
  LAYERS_PER_PAGE,
  LAYER_DEFAULTS,
  MATCHUP_DEFAULTS,
  matchupState,
} from "@/utils/matchup-state";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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
  const overlay = useRef<HTMLDivElement>(null);
  const overlayImage = useRef<HTMLImageElement>(null);
  const [imageEpoch, setImageEpoch] = useState(0);
  const widget = useRef<HTMLDivElement>(null);
  const overlayDrag = useRef<{ dx: number; dy: number } | null>(null);
  const [draggingOverlay, setDraggingOverlay] = useState(false);
  const [widgetSize, setWidgetSize] = useState({ w: RAIL_WIDTH, h: RAIL_MIN_VISIBLE });

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

  useEffect(() => {
    const el = widget.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setWidgetSize({
        w: Math.round(entry.contentRect.width),
        h: Math.round(entry.contentRect.height),
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hydrated]);

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
    setState((current) => ({
      ...current,
      layers: [...current.layers, ...decoded],
      selectedId: decoded[decoded.length - 1]?.id,
    }));
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
      const target = event.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable === true;

      if (!event.altKey && !typing) {
        const step = event.shiftKey ? 10 : 1;
        const nudge =
          event.key === "ArrowLeft"
            ? { dx: -step, dy: 0 }
            : event.key === "ArrowRight"
              ? { dx: step, dy: 0 }
              : event.key === "ArrowUp"
                ? { dx: 0, dy: -step }
                : event.key === "ArrowDown"
                  ? { dx: 0, dy: step }
                  : null;
        if (nudge) {
          const layer = selectedRef.current;
          if (!layer || layer.locked || !layer.visible) return;
          event.preventDefault();
          moveBy(nudge.dx, nudge.dy);
          return;
        }
      }

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

  /** Where the scaled image's top-left corner lands for a given snap point. */
  const anchoredPosition = useCallback(
    (index: number, scale: number) => {
      const image = overlayImage.current;
      const width = (image?.naturalWidth ?? 0) * scale;
      const height = (image?.naturalHeight ?? 0) * scale;
      const col = index % 3;
      const row = Math.floor(index / 3);
      const axis = (cell: number, available: number, size: number) =>
        cell === 0 ? 0 : cell === 1 ? Math.round((available - size) / 2) : Math.round(available - size);
      return {
        x: String(axis(col, viewport.w, width)),
        y: String(axis(row, viewport.h, height)),
      };
    },
    [viewport.w, viewport.h],
  );

  // An anchored layer re-solves its position when the window, scale or image changes.
  useLayoutEffect(() => {
    const layer = selectedRef.current;
    if (!layer || layer.anchor === null) return;
    const next = anchoredPosition(layer.anchor, Number(layer.scale) || 1);
    if (layer.x === next.x && layer.y === next.y) return;
    patchLayer(next);
  }, [
    state.selectedId,
    selected?.anchor,
    selected?.scale,
    selected?.src,
    imageEpoch,
    anchoredPosition,
    patchLayer,
  ]);

  // Composes off the latest state so a held-down arrow key never drops steps.
  const moveBy = (dx: number, dy: number) =>
    setState((current) => {
      const layer = current.layers.find((l) => l.id === current.selectedId);
      if (!layer) return current;
      return {
        ...current,
        layers: current.layers.map((l) =>
          l.id === current.selectedId
            ? {
                ...l,
                anchor: null,
                x: String((Number(l.x) || 0) + dx),
                y: String((Number(l.y) || 0) + dy),
              }
            : l,
        ),
      };
    });

  const onOverlayPointerDown = (event: ReactPointerEvent) => {
    const layer = selectedRef.current;
    if (!layer || layer.locked) return;
    event.preventDefault();
    overlayDrag.current = {
      dx: event.clientX - (Number(layer.x) || 0),
      dy: event.clientY - (Number(layer.y) || 0),
    };
    setDraggingOverlay(true);
    const onMove = (move: PointerEvent) => {
      if (!overlayDrag.current) return;
      patchLayer({
        anchor: null,
        x: String(Math.round(move.clientX - overlayDrag.current.dx)),
        y: String(Math.round(move.clientY - overlayDrag.current.dy)),
      });
    };
    const onUp = () => {
      overlayDrag.current = null;
      setDraggingOverlay(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // Devtools opening shrinks the viewport, which can strand the rail off-screen.
  // Only the rail is pinned inside the edges — the panel flips to whichever side fits.
  const railLeft = Math.max(
    EDGE,
    Math.min(state.origin.left, viewport.w - RAIL_WIDTH - EDGE),
  );
  const maxTop = Math.max(EDGE, viewport.h - widgetSize.h - EDGE);
  const railTop = Math.min(Math.max(EDGE, state.origin.top), maxTop);

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
          x={Number(settings.x) || 0}
          y={Number(settings.y) || 0}
          scale={Number(settings.scale) || 1}
          opacity={settings.opacity}
          difference={settings.difference}
          draggable={!settings.locked}
          dragging={draggingOverlay}
          onPointerDown={onOverlayPointerDown}
          onLoad={() => setImageEpoch((n) => n + 1)}
          ref={overlay}
          imageRef={overlayImage}
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
        ref={widget}
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
            patchLayer(
              settings.anchor === index
                ? { anchor: null }
                : {
                    anchor: index,
                    ...anchoredPosition(index, Number(settings.scale) || 1),
                  },
            )
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

import Overlay from "@/components/Overlay";
import { MatchupPanel } from "@/components/matchup";
import { clamp } from "@/utils/clamp";
import { readDock, writeDock } from "@/utils/matchup-dock";
import { SETTINGS_DEFAULTS, matchupSettings } from "@/utils/matchup-settings";
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
import type { Dock } from "@/utils/matchup-dock";
import type { MatchupSettings } from "@/utils/matchup-settings";
import type { LayerSettings, MatchupState } from "@/utils/matchup-state";
import type { PointerEvent as ReactPointerEvent } from "react";

const SAVE_DEBOUNCE_MS = 300;
const PANEL_WIDTH = 300;
const EDGE = 8;
const RAIL_HEIGHT = 40;
const DRAG_THRESHOLD = 4;

const swallowClick = (event: MouseEvent) => {
  event.stopPropagation();
  event.preventDefault();
};

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
  // Read synchronously: sessionStorage is not async, and hydrating in an effect
  // would flash the widget at the settings corner before it jumped to the
  // dragged position.
  const [dock, setDock] = useState<Dock | undefined>(readDock);
  const [prefs, setPrefs] = useState<MatchupSettings>(SETTINGS_DEFAULTS);
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;
  const [viewport, setViewport] = useState({
    w: window.innerWidth,
    h: window.innerHeight,
  });

  const fileInput = useRef<HTMLInputElement>(null);
  const overlayImage = useRef<HTMLImageElement>(null);
  const [imageEpoch, setImageEpoch] = useState(0);
  const widget = useRef<HTMLDivElement>(null);
  const overlayDrag = useRef<{ dx: number; dy: number } | null>(null);
  const [draggingOverlay, setDraggingOverlay] = useState(false);
  const [widgetSize, setWidgetSize] = useState({
    w: PANEL_WIDTH,
    h: RAIL_HEIGHT,
  });

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
    matchupSettings
      .getValue()
      .then((stored) => setPrefs({ ...SETTINGS_DEFAULTS, ...stored }))
      .catch(() => undefined);
    const unwatch = matchupSettings.watch((next) =>
      setPrefs({ ...SETTINGS_DEFAULTS, ...next }),
    );
    return unwatch;
  }, []);

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
    // A resize event never fires for a tab that was hidden when the script mounted,
    // which would leave the viewport reading 0 and disable position clamping.
    const read = () =>
      setViewport({
        w: document.documentElement.clientWidth || window.innerWidth,
        h: document.documentElement.clientHeight || window.innerHeight,
      });
    read();
    const observer = new ResizeObserver(read);
    observer.observe(document.documentElement);
    document.addEventListener("visibilitychange", read);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", read);
    };
  }, []);

  // Measured after every render rather than only from a ResizeObserver: observer
  // callbacks are part of the rendering steps, so a throttled or hidden tab never
  // delivers them and the widget would keep clamping against a stale height.
  useLayoutEffect(() => {
    const el = widget.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    setWidgetSize((previous) =>
      previous.w === w && previous.h === h ? previous : { w, h },
    );
  });

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
        ...prefsRef.current.layerDefaults,
        id: crypto.randomUUID(),
        name: file.name || "pasted.png",
        src: await readAsDataUrl(file),
      })),
    );
    setState((current) => {
      const layers = [...current.layers, ...decoded];
      const selectedId = decoded[decoded.length - 1]?.id;
      // The new layer is the selected one, so follow it onto its page.
      const index = layers.findIndex((layer) => layer.id === selectedId);
      return {
        ...current,
        layers,
        selectedId,
        page:
          index < 0 ? current.page : Math.floor(index / LAYERS_PER_PAGE) + 1,
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

  /** Where the scaled image's top-left corner lands for a given snap point. */
  const anchoredPosition = useCallback(
    (index: number, scale: number) => {
      const image = overlayImage.current;
      const width = (image?.naturalWidth ?? 0) * scale;
      const height = (image?.naturalHeight ?? 0) * scale;
      const col = index % 3;
      const row = Math.floor(index / 3);
      const axis = (cell: number, available: number, size: number) =>
        cell === 0
          ? 0
          : cell === 1
            ? Math.round((available - size) / 2)
            : Math.round(available - size);
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

  // The rail sits above the panel in one column, so both share the panel's width.
  // Clamping keeps it reachable when devtools opening shrinks the viewport.
  // A hidden or background tab can report a 0x0 viewport. Clamping against that
  // would pin the widget to the corner and refuse to move, so skip it until known.
  const maxLeft =
    viewport.w > 0 ? Math.max(EDGE, viewport.w - PANEL_WIDTH - EDGE) : Infinity;
  const maxTop =
    viewport.h > 0
      ? Math.max(EDGE, viewport.h - widgetSize.h - EDGE)
      : Infinity;
  const corner = prefs.panelPosition;
  const edgeX = dock?.edgeX ?? (corner.endsWith("right") ? "right" : "left");
  const edgeY = dock?.edgeY ?? (corner.startsWith("bottom") ? "bottom" : "top");
  const offsetX = dock?.x ?? EDGE;
  const offsetY = dock?.y ?? EDGE;

  // Resolved from the docked edge, so the widget stays put relative to that edge
  // as it grows and shrinks rather than hanging off the bottom of the window.
  const railLeft = clamp(
    edgeX === "left" ? offsetX : viewport.w - PANEL_WIDTH - offsetX,
    EDGE,
    maxLeft,
  );
  const railTop = clamp(
    edgeY === "top" ? offsetY : viewport.h - widgetSize.h - offsetY,
    EDGE,
    maxTop,
  );

  const onGripPointerDown = (event: ReactPointerEvent) => {
    const startX = event.clientX;
    const startY = event.clientY;
    const from = { left: railLeft, top: railTop };
    let moved = false;
    let landed: Dock | undefined;

    const onMove = (move: PointerEvent) => {
      if (!moved) {
        // Below the threshold this is still a click, so buttons keep working.
        const travelled = Math.hypot(
          move.clientX - startX,
          move.clientY - startY,
        );
        if (travelled < DRAG_THRESHOLD) return;
        moved = true;
      }
      const nextLeft = clamp(
        from.left + (move.clientX - startX),
        EDGE,
        maxLeft,
      );
      const nextTop = clamp(from.top + (move.clientY - startY), EDGE, maxTop);
      const nextEdgeX =
        nextLeft + PANEL_WIDTH / 2 > viewport.w / 2 ? "right" : "left";
      const nextEdgeY =
        nextTop + widgetSize.h / 2 > viewport.h / 2 ? "bottom" : "top";
      landed = {
        edgeX: nextEdgeX,
        edgeY: nextEdgeY,
        x:
          nextEdgeX === "left" ? nextLeft : viewport.w - PANEL_WIDTH - nextLeft,
        y: nextEdgeY === "top" ? nextTop : viewport.h - widgetSize.h - nextTop,
      };
      setDock(landed);
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (!moved) return;
      // Persisted once on release, not on every move: this is a per-tab memory
      // for a reload, not a running log of the drag.
      if (landed) writeDock(landed);
      // Swallow the click this release would otherwise fire on whatever was grabbed,
      // then drop the listener so it can never eat an unrelated click later.
      window.addEventListener("click", swallowClick, {
        capture: true,
        once: true,
      });
      setTimeout(
        () =>
          window.removeEventListener("click", swallowClick, { capture: true }),
        0,
      );
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
          left: railLeft,
          top: railTop,
          zIndex: 2147483647,
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
          hasSelection={Boolean(selected)}
          onOpenSettings={() =>
            void browser.runtime.sendMessage({ type: "matchup:open-settings" })
          }
          onOpenHelp={() =>
            void browser.runtime.sendMessage({ type: "matchup:open-help" })
          }
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
          onReorderLayers={(fromId, toId) =>
            setState((current) => {
              const from = current.layers.findIndex((l) => l.id === fromId);
              const to = current.layers.findIndex((l) => l.id === toId);
              if (from < 0 || to < 0 || from === to) return current;
              const layers = [...current.layers];
              const [moved] = layers.splice(from, 1);
              if (!moved) return current;
              layers.splice(to, 0, moved);
              return { ...current, layers };
            })
          }
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

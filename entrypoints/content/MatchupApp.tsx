import Overlay from "@/components/Overlay";
import { MatchupPanel } from "@/components/matchup";
import { clamp } from "@/utils/clamp";
import { patchTab, readTab } from "@/utils/matchup-tab";
import {
  SETTINGS_DEFAULTS,
  matchupSettings,
  restoreSettings,
} from "@/utils/matchup-settings";
import {
  ACCEPTED_TYPES,
  LAYER_DEFAULTS,
  MATCHUP_DEFAULTS,
  matchupState,
  restoreState,
} from "@/utils/matchup-state";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { browser } from "wxt/browser";
import type { Dock } from "@/utils/matchup-tab";
import type { MatchupSettings, ShortcutAction } from "@/utils/matchup-settings";
import type { LayerSettings, MatchupState } from "@/utils/matchup-state";
import type { PointerEvent as ReactPointerEvent } from "react";

const SAVE_DEBOUNCE_MS = 300;
/** Only a first guess: the real size is measured after the first render below. */
const PANEL_WIDTH = 300;
const EDGE = 8;
const TOOLBAR_HEIGHT = 40;
const DRAG_THRESHOLD = 4;

const swallowClick = (event: MouseEvent) => {
  event.stopPropagation();
  event.preventDefault();
};

/**
 * How far the widget may sit from the top or left edge on one axis.
 *
 * The margin is a preference, not a rule: in a viewport too small to hold the
 * widget with margins — a 300px-wide window against the 300px panel — insisting
 * on it produced min > max, which pinned the widget to a single point 8px off
 * the right edge and killed the drag on that axis entirely. Dropping the margin
 * there keeps the widget fully visible and keeps whatever travel is left.
 */
const travel = (available: number, size: number) => {
  // A hidden or background tab can report a 0x0 viewport. Clamping against that
  // would pin the widget to the corner and refuse to move, so skip it until known.
  if (available <= 0) return { min: -Infinity, max: Infinity };
  const max = available - size - EDGE;
  return max >= EDGE
    ? { min: EDGE, max }
    : { min: 0, max: Math.max(0, available - size) };
};

/**
 * Whether the keystroke is going somewhere text is being typed — the layer rename
 * field, or any input on the host page. `composedPath` because the listener sits on
 * window, which only ever sees the shadow host as the target.
 */
const isEditable = (event: KeyboardEvent) => {
  const target = event.composedPath()[0];
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
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
  // Both read synchronously: sessionStorage is not async, and hydrating in an
  // effect would flash the widget at the settings corner before it jumped to
  // the dragged position.
  const [open, setOpen] = useState(() => readTab().open);
  const [dock, setDock] = useState<Dock | undefined>(() => readTab().dock);
  const openRef = useRef(open);
  openRef.current = open;
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
  const [widgetSize, setWidgetSize] = useState({
    w: PANEL_WIDTH,
    h: TOOLBAR_HEIGHT,
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
      .then((stored) => setPrefs(restoreSettings(stored)))
      .catch(() => undefined);
    const unwatch = matchupSettings.watch((next) =>
      setPrefs(restoreSettings(next)),
    );
    return unwatch;
  }, []);

  useEffect(() => {
    matchupState
      .getValue()
      .then((stored) => setState(restoreState(stored)))
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
    // Selecting the new layer is enough to reach it: the grid scrolls, and the
    // tile scrolls itself into view when it becomes the selected one.
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
        const next = !openRef.current;
        // Claimed on the ref immediately, so two clicks landing in one task
        // can't both read the same pre-toggle value and cancel each other out.
        openRef.current = next;
        setOpen(next);
        // Written here rather than from an effect on `open`, so that merely
        // visiting a page never touches its sessionStorage: the content script
        // runs on every URL, and only a deliberate toggle should leave a trace.
        patchTab({ open: next });
      }
    };
    browser.runtime.onMessage.addListener(onMessage);
    return () => browser.runtime.onMessage.removeListener(onMessage);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey || event.metaKey || event.ctrlKey) return;
      if (isEditable(event)) return;
      // Read from settings rather than hardcoded, and from the ref so a rebind
      // takes effect without re-subscribing this listener.
      const bindings = prefsRef.current.shortcuts;
      const action = (Object.keys(bindings) as ShortcutAction[]).find(
        (candidate) => bindings[candidate] === event.code,
      );
      switch (action) {
        case "toggleVisible":
          patchLayer({ visible: !selectedRef.current?.visible });
          break;
        case "toggleLocked":
          patchLayer({ locked: !selectedRef.current?.locked });
          break;
        case "toggleDifference":
          patchLayer({ difference: !selectedRef.current?.difference });
          break;
        case "togglePanel":
          setState((c) => ({ ...c, panelOpen: !c.panelOpen }));
          break;
        case "upload":
          // A keydown carries user activation, which is what the file dialog
          // needs; preventDefault below doesn't spend it.
          fileInput.current?.click();
          break;
        default:
          return;
      }
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
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const corner = prefs.panelPosition;
  const edgeX = dock?.edgeX ?? (corner.endsWith("right") ? "right" : "left");
  const edgeY = dock?.edgeY ?? (corner.startsWith("bottom") ? "bottom" : "top");
  const offsetX = dock?.x ?? EDGE;
  const offsetY = dock?.y ?? EDGE;

  // Resolved from the docked edge, so the widget stays put relative to that edge
  // as it grows and shrinks rather than hanging off the bottom of the window.
  const xTravel = travel(viewport.w, widgetSize.w);
  const yTravel = travel(viewport.h, widgetSize.h);
  const widgetLeft = clamp(
    edgeX === "left" ? offsetX : viewport.w - widgetSize.w - offsetX,
    xTravel.min,
    xTravel.max,
  );
  const widgetTop = clamp(
    edgeY === "top" ? offsetY : viewport.h - widgetSize.h - offsetY,
    yTravel.min,
    yTravel.max,
  );

  // Read inside the drag rather than closed over: the viewport and the widget's
  // own height both change mid-drag (devtools opening, an image finishing), and
  // stale bounds would clamp the widget to a position the pointer has left.
  const geometry = useRef({ viewport, widgetSize, widgetLeft, widgetTop });
  geometry.current = { viewport, widgetSize, widgetLeft, widgetTop };

  const onGripPointerDown = (event: ReactPointerEvent) => {
    const grip = event.currentTarget as HTMLElement;
    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startY = event.clientY;
    const from = {
      left: geometry.current.widgetLeft,
      top: geometry.current.widgetTop,
    };
    let moved = false;
    let landed: Dock | undefined;

    const onMove = (move: PointerEvent) => {
      if (move.pointerId !== pointerId) return;
      if (!moved) {
        // Below the threshold this is still a click, so buttons keep working.
        const travelled = Math.hypot(
          move.clientX - startX,
          move.clientY - startY,
        );
        if (travelled < DRAG_THRESHOLD) return;
        moved = true;
        // Only captured once it is definitely a drag: capturing on pointerdown
        // would retarget the click and break the toolbar's own toggle buttons.
        // Without it the drag dies the moment the pointer crosses an iframe on
        // the host page, which is most of the width of a narrow viewport.
        try {
          grip.setPointerCapture(pointerId);
        } catch {
          // Not fatal — the window listeners below still track the pointer for
          // as long as it stays over this document.
        }
      }
      const { viewport: vp, widgetSize: size } = geometry.current;
      const bx = travel(vp.w, size.w);
      const by = travel(vp.h, size.h);
      const nextLeft = clamp(
        from.left + (move.clientX - startX),
        bx.min,
        bx.max,
      );
      const nextTop = clamp(from.top + (move.clientY - startY), by.min, by.max);
      const nextEdgeX = nextLeft + size.w / 2 > vp.w / 2 ? "right" : "left";
      const nextEdgeY = nextTop + size.h / 2 > vp.h / 2 ? "bottom" : "top";
      landed = {
        edgeX: nextEdgeX,
        edgeY: nextEdgeY,
        x: nextEdgeX === "left" ? nextLeft : vp.w - size.w - nextLeft,
        y: nextEdgeY === "top" ? nextTop : vp.h - size.h - nextTop,
      };
      setDock(landed);
    };

    const onUp = (up: PointerEvent) => {
      if (up.pointerId !== pointerId) return;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (grip.hasPointerCapture(pointerId)) {
        grip.releasePointerCapture(pointerId);
      }
      if (!moved) return;
      // Persisted once on release, not on every move: this is a per-tab memory
      // for a reload, not a running log of the drag.
      if (landed) patchTab({ dock: landed });
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
    window.addEventListener("pointercancel", onUp);
  };

  if (!hydrated || !open) return null;

  const settings: LayerSettings = selected ?? LAYER_DEFAULTS;

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
          left: widgetLeft,
          top: widgetTop,
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
          error={error}
          panelOpen={state.panelOpen}
          hasSelection={Boolean(selected)}
          shortcuts={prefs.shortcuts}
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
          onUpload={() => fileInput.current?.click()}
          onPaste={() => void pasteFromClipboard()}
          onDismissError={() => setError(undefined)}
          onDropFiles={(files) => void addFiles(files)}
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
              const layers = [...current.layers];
              const [moved] = layers.splice(from, 1);
              if (!moved) return current;
              // Pulling the layer out shifts the target down one when it sat after it.
              const at = from < target ? target - 1 : target;
              layers.splice(before ? at : at + 1, 0, moved);
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

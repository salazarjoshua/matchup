import Overlay from "@/components/Overlay";
import { MatchupPanel } from "@/components/matchup/MatchupPanel";
import { clamp } from "@/utils/clamp";
import { patchTab, readTab } from "@/utils/matchup-tab";
import { useMatchupSettings, useMatchupStore } from "@/utils/use-matchup-store";
import { PAGE_STATE, TELL_REMOTE } from "@/utils/side-panel";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { browser } from "wxt/browser";
import type { Dock } from "@/utils/matchup-tab";
import type { LayerSettings, LayerSize } from "@/utils/matchup-state";
import type { ShortcutAction } from "@/utils/matchup-settings";
import type { PointerEvent as ReactPointerEvent } from "react";

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

/** Mounted only while Matchup is open on this page — the content script entry owns that
 *  flag, because it has to be reachable with nothing rendered. */
export default function MatchupApp() {
  // Read synchronously: sessionStorage is not async, and hydrating in an effect would
  // flash the widget at the settings corner before it jumped to the dragged position.
  const [dock, setDock] = useState<Dock | undefined>(() => readTab().dock);
  /** True while a side panel is showing this tab, which is the page's cue to stand
   *  down — and, when it drops, to come back. */
  const [remote, setRemote] = useState(() => readTab().remote === true);
  const prefs = useMatchupSettings();
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;
  const {
    state,
    setState,
    selected,
    settings,
    hydrated,
    pickFiles,
    patch,
    patchLayer,
    addFiles,
    panelProps,
  } = useMatchupStore(window.location.origin, prefs);
  const [viewport, setViewport] = useState({
    w: window.innerWidth,
    h: window.innerHeight,
  });
  // The scrollable page, which is the frame an unpinned layer anchors against.
  // Initialised synchronously for the same reason the viewport is: the anchor is
  // re-solved in a layout effect, which runs before the effect below ever has.
  const [page, setPage] = useState({
    w: document.documentElement.scrollWidth,
    h: document.documentElement.scrollHeight,
  });

  const overlayImage = useRef<HTMLImageElement>(null);
  const [imageEpoch, setImageEpoch] = useState(0);
  const widget = useRef<HTMLDivElement>(null);
  const overlayDrag = useRef<{ dx: number; dy: number } | null>(null);
  const [widgetSize, setWidgetSize] = useState({
    w: PANEL_WIDTH,
    h: TOOLBAR_HEIGHT,
  });

  useEffect(() => {
    // A resize event never fires for a tab that was hidden when the script mounted,
    // which would leave the viewport reading 0 and disable position clamping.
    const read = () => {
      const root = document.documentElement;
      setViewport({
        w: root.clientWidth || window.innerWidth,
        h: root.clientHeight || window.innerHeight,
      });
      // Observing <html> catches this for a page whose height follows its content,
      // which is most of them; one that scrolls an inner element instead only
      // re-measures when the window does. Anchoring is a snap, not a live tie.
      setPage({ w: root.scrollWidth, h: root.scrollHeight });
    };
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

  useEffect(() => {
    const onRemote = (message: unknown) => {
      const next = message as { type?: string; remote?: boolean };
      if (next?.type !== TELL_REMOTE) return;
      const showing = Boolean(next.remote);
      setRemote(showing);
      // Only on a change, so merely visiting a page still leaves no trace in its
      // sessionStorage — the background greets every content script with a false.
      if ((readTab().remote === true) !== showing)
        patchTab({ remote: showing });
    };
    browser.runtime.onMessage.addListener(onRemote);
    return () => browser.runtime.onMessage.removeListener(onRemote);
  }, []);

  // Announced on mount, which is what survives a navigation: a side panel already open
  // has no other way to learn Matchup is running here. Turning it off is announced by
  // the entry instead, since this is gone by then.
  useEffect(() => {
    void browser.runtime
      .sendMessage({ type: PAGE_STATE, open: true })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
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
        case "toggleInvert":
          patchLayer({ invert: !selectedRef.current?.invert });
          break;
        case "togglePanel":
          setState((c) => ({ ...c, panelOpen: !c.panelOpen }));
          break;
        case "upload":
          // A keydown carries user activation, which is what the file dialog
          // needs; preventDefault below doesn't spend it.
          pickFiles();
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
  }, [addFiles, pickFiles, patchLayer]);

  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  /** Where the scaled image's top-left corner lands for a given snap point. */
  const anchoredPosition = useCallback(
    (
      index: number,
      layer: Pick<LayerSettings, "scale"> & Partial<LayerSize>,
    ) => {
      // The size on screen, which is the layer's own multiplied by scale — and the
      // image's own only for a layer that never got a measurement.
      const image = overlayImage.current;
      const scale = Number(layer.scale) || 1;
      const width = (Number(layer.width) || image?.naturalWidth || 0) * scale;
      const height =
        (Number(layer.height) || image?.naturalHeight || 0) * scale;
      const col = index % 3;
      const row = Math.floor(index / 3);
      const axis = (cell: number, available: number, size: number) =>
        cell === 0
          ? 0
          : cell === 1
            ? Math.round((available - size) / 2)
            : Math.round(available - size);
      // Whatever a layer's coordinates are measured against is what its corners are:
      // snapping an unpinned layer to the window would only ever mean "wherever I
      // happen to have scrolled to", which is not a position at all.
      const frame = settings.pinned ? viewport : page;
      return {
        x: String(axis(col, frame.w, width)),
        y: String(axis(row, frame.h, height)),
      };
    },
    [settings.pinned, viewport.w, viewport.h, page.w, page.h],
  );

  // An anchored layer re-solves its position when the window, its size or the image changes.
  useLayoutEffect(() => {
    const layer = selectedRef.current;
    if (!layer || layer.anchor === null) return;
    const next = anchoredPosition(layer.anchor, layer);
    if (layer.x === next.x && layer.y === next.y) return;
    patchLayer(next);
  }, [
    state.selectedId,
    selected?.anchor,
    selected?.scale,
    selected?.width,
    selected?.height,
    selected?.src,
    imageEpoch,
    anchoredPosition,
    patchLayer,
  ]);

  /**
   * Pinning and unpinning re-reads the same numbers against a different origin, so
   * without this the image jumps by however far the page is scrolled. Done here on
   * the change rather than in the toolbar's handler because the side panel can flip
   * the same switch, and only the page knows its own scroll offset.
   */
  const pinnedBefore = useRef<{ id?: string; pinned?: boolean }>({});
  useLayoutEffect(() => {
    const layer = selectedRef.current;
    if (!layer) return;
    const previous = pinnedBefore.current;
    pinnedBefore.current = { id: layer.id, pinned: layer.pinned };
    // A different layer is a different set of coordinates, not a conversion; an
    // anchored one is about to be re-solved against its new frame anyway.
    if (previous.id !== layer.id || previous.pinned === layer.pinned) return;
    if (layer.anchor !== null) return;
    const shift = layer.pinned ? -1 : 1;
    patchLayer({
      x: String(Math.round((Number(layer.x) || 0) + shift * window.scrollX)),
      y: String(Math.round((Number(layer.y) || 0) + shift * window.scrollY)),
    });
  }, [state.selectedId, selected?.pinned, patchLayer]);

  /**
   * The image is the only place a layer can learn its own size, so a layer added
   * before sizes were stored — or one whose measurement failed — takes it here, on
   * the first paint that has it. Written once: `width` is the user's from then on.
   */
  const onOverlayLoad = (size: {
    naturalWidth: number;
    naturalHeight: number;
  }) => {
    setImageEpoch((n) => n + 1);
    const layer = selectedRef.current;
    if (!layer || !size.naturalWidth || !size.naturalHeight) return;
    if (layer.naturalWidth === size.naturalWidth && layer.width) return;
    patchLayer({
      ...size,
      width: layer.width || String(size.naturalWidth),
      height: layer.height || String(size.naturalHeight),
    });
  };

  const onOverlayPointerDown = (event: ReactPointerEvent) => {
    const layer = selectedRef.current;
    if (!layer || layer.locked) return;
    event.preventDefault();
    // The pointer is in window coordinates and an unpinned layer is not, so the
    // scroll offset closes the gap — read on every move rather than once, so a page
    // that scrolls mid-drag still leaves the image under the cursor.
    const offset = () =>
      layer.pinned ? { x: 0, y: 0 } : { x: window.scrollX, y: window.scrollY };
    const start = offset();
    overlayDrag.current = {
      dx: event.clientX + start.x - (Number(layer.x) || 0),
      dy: event.clientY + start.y - (Number(layer.y) || 0),
    };
    const onMove = (move: PointerEvent) => {
      if (!overlayDrag.current) return;
      const from = offset();
      patchLayer({
        anchor: null,
        x: String(Math.round(move.clientX + from.x - overlayDrag.current.dx)),
        y: String(Math.round(move.clientY + from.y - overlayDrag.current.dy)),
      });
    };
    // pointercancel as well as pointerup, the same as the grip drag: the browser
    // takes the pointer away often enough — a touch turning into a scroll, the tab
    // losing focus — and without it the listeners stay on and the image goes on
    // following a pointer that is no longer down.
    const onUp = () => {
      overlayDrag.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
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

  if (!hydrated) return null;

  return (
    <>
      {selected?.src && settings.visible && (
        <Overlay
          src={selected.src}
          x={Number(settings.x) || 0}
          y={Number(settings.y) || 0}
          width={Number(settings.width) || undefined}
          height={Number(settings.height) || undefined}
          scale={Number(settings.scale) || 1}
          opacity={settings.opacity}
          invert={settings.invert}
          pinned={settings.pinned}
          draggable={!settings.locked}
          onPointerDown={onOverlayPointerDown}
          onLoad={onOverlayLoad}
          imageRef={overlayImage}
        />
      )}

      {!remote && (
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
            {...panelProps}
            panelOpen={state.panelOpen}
            onTogglePanel={() => patch({ panelOpen: !state.panelOpen })}
            // Unlike the side panel, the page knows what frame the layer is in, so a
            // snap point can be solved to real coordinates the moment it is picked.
            onAnchorSelect={(index) =>
              patchLayer(
                settings.anchor === index
                  ? { anchor: null }
                  : { anchor: index, ...anchoredPosition(index, settings) },
              )
            }
            onGripPointerDown={onGripPointerDown}
            onToggleSidePanel={() =>
              void browser.runtime.sendMessage({
                type: "matchup:open-side-panel",
              })
            }
          />
        </div>
      )}
    </>
  );
}

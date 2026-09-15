import { useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, Ref } from "react";
import type { BlendMode } from "@/utils/matchup-state";

type OverlayProps = {
  src: string;
  x: number;
  y: number;
  /**
   * The size the image is laid out at, before scale. Left off for a layer with no
   * measurement — an SVG that carries none, or one stored before sizes were — and the
   * image falls back to its own.
   */
  width?: number;
  height?: number;
  /** Multiplies the size above rather than replacing it, so W and H keep reading as drawn. */
  scale: number;
  /** 0–100. */
  opacity: number;
  blendMode: BlendMode;
  /** x/y are read against the window rather than the page — see below. */
  pinned?: boolean;
  /** Locking the layer hands clicks back to the page underneath. */
  draggable?: boolean;
  onPointerDown?: (event: ReactPointerEvent) => void;
  /** Carries the image's own size, which is the only place a layer can learn it. */
  onLoad?: (size: { naturalWidth: number; naturalHeight: number }) => void;
  imageRef?: Ref<HTMLImageElement>;
};

const probeStyle = {
  position: "absolute",
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  pointerEvents: "none",
} as const;

/**
 * There is exactly one positioning model: the top-left corner of the scaled image
 * sits at (x, y). Anchors are arithmetic on x/y, never a second way to lay this out —
 * otherwise releasing an anchor moves the image out from under the cursor.
 *
 * What (x, y) is measured from is the layer's `pinned` flag and nothing else: the
 * page by default, so the image scrolls with the content it is being compared
 * against, or the window when pinned, for a header or anything else that doesn't move.
 */
const Overlay = ({
  src,
  x,
  y,
  width,
  height,
  scale,
  opacity,
  blendMode,
  pinned = false,
  draggable = false,
  onPointerDown,
  onLoad,
  imageRef,
}: OverlayProps) => {
  const probe = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  /** The size on screen: what the layer is set to, times scale. */
  const drawn =
    width && height
      ? { width: width * scale, height: height * scale }
      : undefined;

  /**
   * Where the box an absolute overlay is positioned from actually starts, in page
   * coordinates. Usually (0, 0) — but this tree hangs off the host page's <body>,
   * and a site that gives body a position or a transform makes that the box
   * instead, which would put the image somewhere else on that site alone. A
   * zero-size probe is the only honest way to know: it lands wherever an absolute
   * child of ours lands, so x/y are simply offset by it.
   */
  useLayoutEffect(() => {
    const el = probe.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const next = {
        x: Math.round(rect.left + window.scrollX),
        y: Math.round(rect.top + window.scrollY),
      };
      setOrigin((previous) =>
        previous.x === next.x && previous.y === next.y ? previous : next,
      );
    };
    measure();
    // That box moves with the host page's own layout, which nothing here renders in
    // response to — a banner appearing above the fold is enough to shift it.
    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={probe} style={probeStyle} aria-hidden />
      <div
        onPointerDown={draggable ? onPointerDown : undefined}
        style={{
          /**
           * Absolute, so the page scrolls the image itself. Holding a fixed element
           * in place from a scroll handler is a frame behind the compositor the
           * whole way down, and dead still through the rubber-band at either end —
           * scrollY is clamped there and never reports the overshoot, so the image
           * tears away from the content it is supposed to be lying on top of.
           */
          position: pinned ? "fixed" : "absolute",
          left: `${pinned ? x : x - origin.x}px`,
          top: `${pinned ? y : y - origin.y}px`,
          pointerEvents: draggable ? "auto" : "none",
          // Inversion is a CSS filter rather than a blend mode; the layer calls
          // it a blend mode because that is what it is for.
          filter: blendMode === "invert" ? "invert(1)" : "none",
          cursor: "move",
          touchAction: draggable ? "none" : undefined,
          zIndex: 2147483646,
        }}
      >
        <img
          ref={imageRef}
          src={src}
          alt=""
          draggable={false}
          onLoad={(event) =>
            onLoad?.({
              naturalWidth: event.currentTarget.naturalWidth,
              naturalHeight: event.currentTarget.naturalHeight,
            })
          }
          style={{
            userSelect: "none",
            display: "block",
            opacity: opacity / 100,
            maxWidth: "none",
            /**
             * Scale is laid out, not transformed. A transform shrinks what you see
             * and leaves the layout box at full size, and an absolute box is part of
             * the page's scrollable area — so a 2000px screenshot at half scale sat
             * 1:1 over a 1000px page while giving it 2000px of scroll in both axes.
             */
            width: drawn ? `${drawn.width}px` : undefined,
            height: drawn ? `${drawn.height}px` : undefined,
            // Only where there is no measurement to scale — an SVG carrying no size
            // of its own. The layout box is wrong there in the same way, but nothing
            // here knows what the right one would be.
            transform: drawn ? undefined : `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      </div>
    </>
  );
};

export default Overlay;

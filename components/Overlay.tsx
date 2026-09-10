import type { PointerEvent as ReactPointerEvent, Ref } from "react";

type OverlayProps = {
  src: string;
  x: number;
  y: number;
  scale: number;
  /** 0–100. */
  opacity: number;
  difference: boolean;
  /** Locking the layer hands clicks back to the page underneath. */
  draggable?: boolean;
  dragging?: boolean;
  onPointerDown?: (event: ReactPointerEvent) => void;
  onLoad?: () => void;
  imageRef?: Ref<HTMLImageElement>;
};

/**
 * There is exactly one positioning model: the top-left corner of the scaled image
 * sits at (x, y). Anchors are arithmetic on x/y, never a second way to lay this out —
 * otherwise releasing an anchor moves the image out from under the cursor.
 */
const Overlay = ({
  src,
  x,
  y,
  scale,
  opacity,
  difference,
  draggable = false,
  dragging = false,
  onPointerDown,
  onLoad,
  imageRef,
}: OverlayProps) => (
  <div
    onPointerDown={draggable ? onPointerDown : undefined}
    style={{
      position: "fixed",
      left: `${x}px`,
      top: `${y}px`,
      mixBlendMode: difference ? "difference" : "normal",
      pointerEvents: draggable ? "auto" : "none",
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
      onLoad={onLoad}
      style={{
        userSelect: "none",
        display: "block",
        opacity: opacity / 100,
        maxWidth: "none",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    />
  </div>
);

export default Overlay;

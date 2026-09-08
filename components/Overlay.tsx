import type { PointerEvent as ReactPointerEvent, Ref } from 'react';

type OverlayProps = {
  src: string;
  /** Index 0–8 of the active snap point, or null when x/y are used directly. */
  anchor: number | null;
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
  ref?: Ref<HTMLDivElement>;
};

const EDGE = ['0px', '50%', '100%'];
const SHIFT = ['0%', '-50%', '-100%'];
const ORIGIN = [
  'top left',
  'top center',
  'top right',
  'center left',
  'center',
  'center right',
  'bottom left',
  'bottom center',
  'bottom right',
];

const Overlay = ({
  src,
  anchor,
  x,
  y,
  scale,
  opacity,
  difference,
  draggable = false,
  dragging = false,
  onPointerDown,
  ref,
}: OverlayProps) => {
  const col = anchor === null ? 0 : anchor % 3;
  const row = anchor === null ? 0 : Math.floor(anchor / 3);

  return (
    <div
      ref={ref}
      onPointerDown={draggable ? onPointerDown : undefined}
      style={{
        position: 'fixed',
        left: anchor === null ? `${x}px` : EDGE[col],
        top: anchor === null ? `${y}px` : EDGE[row],
        transform: anchor === null ? undefined : `translate(${SHIFT[col]}, ${SHIFT[row]})`,
        mixBlendMode: difference ? 'difference' : 'normal',
        // Only grabs clicks while it can actually be moved; locked overlays are inert.
        pointerEvents: draggable ? 'auto' : 'none',
        cursor: draggable ? (dragging ? 'grabbing' : 'grab') : undefined,
        touchAction: draggable ? 'none' : undefined,
        zIndex: 2147483646,
      }}>
      <img
        src={src}
        alt=""
        draggable={false}
        style={{
          display: 'block',
          opacity: opacity / 100,
          maxWidth: 'none',
          transform: `scale(${scale})`,
          transformOrigin: anchor === null ? 'top left' : ORIGIN[anchor],
        }}
      />
    </div>
  );
};

export default Overlay;

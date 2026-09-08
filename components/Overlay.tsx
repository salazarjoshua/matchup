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

const Overlay = ({ src, anchor, x, y, scale, opacity, difference }: OverlayProps) => {
  const col = anchor === null ? 0 : anchor % 3;
  const row = anchor === null ? 0 : Math.floor(anchor / 3);

  return (
    <div
      // Never intercepts clicks: the point of the tool is comparing against a live page.
      style={{
        position: 'fixed',
        left: anchor === null ? `${x}px` : EDGE[col],
        top: anchor === null ? `${y}px` : EDGE[row],
        transform: anchor === null ? undefined : `translate(${SHIFT[col]}, ${SHIFT[row]})`,
        mixBlendMode: difference ? 'difference' : 'normal',
        pointerEvents: 'none',
        zIndex: 2147483646,
      }}>
      <img
        src={src}
        alt=""
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

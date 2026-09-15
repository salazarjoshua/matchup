import { cn } from "@/utils/cn";
import { useLayoutEffect, useRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode, RefObject } from "react";
import { UploadImageIcon } from "@/components/icons";

const REORDER_MS = 120;
/** var(--ease-out). */
const REORDER_EASING = "cubic-bezier(0, 0, 0.2, 1)";

/**
 * FLIP. React has already moved each tile to its new slot by the time this runs, so
 * every one that shifted is animated from where it used to be back to zero and the
 * browser composites the transform — no library, no layout per frame.
 *
 * Tiles are keyed by node identity rather than by id: a keyed reorder moves the same
 * DOM nodes, and a WeakMap lets a deleted one fall out on its own. Offsets are read
 * against the grid rather than the viewport so neither scrolling the list nor a banner
 * opening above it can strand a stale position.
 */
const useReorderMotion = (
  root: RefObject<HTMLDivElement | null>,
  order?: string,
) => {
  const previous = useRef(new WeakMap<Element, { x: number; y: number }>());

  useLayoutEffect(() => {
    const grid = root.current;
    if (!grid) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    for (const child of Array.from(grid.children)) {
      const tile = child as HTMLElement;
      const next = {
        x: tile.offsetLeft - grid.offsetLeft,
        y: tile.offsetTop - grid.offsetTop,
      };
      const prev = previous.current.get(tile);
      previous.current.set(tile, next);
      if (reduced || !prev) continue;
      const dx = prev.x - next.x;
      const dy = prev.y - next.y;
      if (dx === 0 && dy === 0) continue;
      tile.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
        { duration: REORDER_MS, easing: REORDER_EASING },
      );
    }
  }, [root, order]);
};

type LayerGridProps = ComponentPropsWithoutRef<"div"> & {
  children: ReactNode;
  /** Changes with the layer order, and is the only thing that re-measures the grid. */
  order?: string;
};

const LayerGrid = ({
  className,
  order,
  children,
  ...props
}: LayerGridProps) => {
  const root = useRef<HTMLDivElement>(null);
  useReorderMotion(root, order);

  return (
    <div
      ref={root}
      className={cn(
        "grid grid-cols-3 gap-2.5 p-3",
        "max-h-66 scrollbar-panel overflow-y-auto",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const UploadTile = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"button">) => (
  <button
    type="button"
    className={cn(
      "border-[1.5px] h-16 rounded-xl border-placeholder text-placeholder grid place-items-center border-dashed",
      "transition-[background] hover:bg-surface focus-visible:border-transparent",
      className,
    )}
    {...props}
  >
    <UploadImageIcon className="w-6" />
  </button>
);

export { LayerGrid, UploadTile };

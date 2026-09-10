import { cn } from "@/utils/cn";
import { LAYER_GRID } from "@/utils/matchup-state";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { PlusIcon, UploadImageIcon } from "@/components/icons";

type LayerGridProps = ComponentPropsWithoutRef<"div"> & { children: ReactNode };

const LayerGrid = ({
  className,
  style,
  children,
  ...props
}: LayerGridProps) => (
  <div
    className={cn("grid gap-3 p-3", className)}
    // Inline rather than a grid-cols-* class: the column count is configuration,
    // and Tailwind can only generate classes it can actually see in the source.
    style={{
      gridTemplateColumns: `repeat(${LAYER_GRID.columns}, minmax(0, 1fr))`,
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const AddTile = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"button">) => (
  <button
    type="button"
    className={cn("flex min-w-0 flex-col gap-2 text-left", className)}
    {...props}
  >
    <div className="border-[1.5px] h-thumb rounded-control border-placeholder text-placeholder grid place-items-center border-dashed">
      <UploadImageIcon className="w-6" />
    </div>
  </button>
);

/**
 * The add control, for the footer row beside the pager. It sits outside the grid
 * on purpose: as a grid cell it had nowhere to go once a page filled up, and
 * simply vanished.
 */
const AddButton = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"button">) => (
  <button
    type="button"
    className={cn(
      "h-control rounded-control bg-surface hover:bg-surface-hover text-ink",
      "duration-120 flex items-center gap-1 pl-2 pr-3 transition-colors ease-out",
      "focus-visible:ring-[1.5px] focus-visible:ring-accent-blue focus-visible:outline-none",
      className,
    )}
    {...props}
  >
    <PlusIcon className="w-4" />
    <span className="text-tile-label">Add</span>
  </button>
);

const DropTarget = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) => (
  <div className={cn("flex min-w-0 flex-col gap-2", className)} {...props}>
    <div className="border-[1.5px] h-thumb rounded-control border-accent-blue bg-accent-blue/5 border-dashed" />
    <div className="text-micro text-muted truncate">drop here</div>
  </div>
);

export { LayerGrid, AddTile, AddButton, DropTarget };
export type { LayerGridProps };

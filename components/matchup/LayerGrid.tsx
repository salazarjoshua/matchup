import { cn } from "@/utils/cn";
import { LAYER_COLUMNS } from "@/utils/matchup-state";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { UploadImageIcon } from "@/components/icons";

type LayerGridProps = ComponentPropsWithoutRef<"div"> & { children: ReactNode };

const LayerGrid = ({
  className,
  style,
  children,
  ...props
}: LayerGridProps) => (
  <div
    className={cn(
      "grid gap-3 p-3",
      // Scrolls rather than paginates, which is what lets the UploadTile always
      // have a cell to sit in however many layers there are.
      "max-h-layer-list scrollbar-panel overflow-y-auto",
      className,
    )}
    // Inline rather than a grid-cols-* class: the column count is configuration,
    // and Tailwind can only generate classes it can actually see in the source.
    style={{
      gridTemplateColumns: `repeat(${LAYER_COLUMNS}, minmax(0, 1fr))`,
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

/** The tile that opens the file picker. See .idea/VOCABULARY.md — Upload. */
const UploadTile = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"button">) => (
  <button
    type="button"
    className={cn(
      "border-[1.5px] h-thumb rounded-control border-placeholder text-placeholder grid place-items-center border-dashed",
      "transition-[background] hover:bg-surface focus-visible:border-transparent",
      className,
    )}
    {...props}
  >
    <UploadImageIcon className="w-6" />
  </button>
);

export { LayerGrid, UploadTile };
export type { LayerGridProps };

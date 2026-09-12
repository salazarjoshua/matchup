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
      "grid gap-2 p-3",
      "max-h-66 scrollbar-panel overflow-y-auto",
      className,
    )}
    style={{
      gridTemplateColumns: `repeat(${LAYER_COLUMNS}, minmax(0, 1fr))`,
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

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
export type { LayerGridProps };

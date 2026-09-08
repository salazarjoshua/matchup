import { cn } from "@/utils/cn";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { DownloadIcon, PlusIcon } from "@/components/icons";

const LAYERS_PER_PAGE = 6;
const MAX_LAYERS = 8;

type LayerGridProps = ComponentPropsWithoutRef<"div"> & { children: ReactNode };

const LayerGrid = ({ className, children, ...props }: LayerGridProps) => (
  <div className={cn("grid grid-cols-3 gap-3 p-3", className)} {...props}>
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
    <span className="border-[1.5px] h-thumb rounded-control border-disabled text-muted grid place-items-center border-dashed">
      {/* <DownloadIcon className="w-4" /> */}
      <PlusIcon className="w-4" />
    </span>
  </button>
);

const DropTarget = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) => (
  <div className={cn("flex min-w-0 flex-col gap-2", className)} {...props}>
    <div className="border-[1.5px] h-thumb rounded-control border-accent-blue bg-accent-blue/5 border-dashed" />
    <div className="text-micro text-muted truncate font-mono">drop here</div>
  </div>
);

export { LayerGrid, AddTile, DropTarget, LAYERS_PER_PAGE, MAX_LAYERS };
export type { LayerGridProps };

import { cn } from "@/utils/cn";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { PlusIcon, UploadImageIcon } from "@/components/icons";

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
    <div className="border-[1.5px] h-thumb rounded-control border-placeholder text-placeholder grid place-items-center border-dashed">
      <UploadImageIcon className="w-6" />
    </div>
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

export { LayerGrid, AddTile, DropTarget };
export type { LayerGridProps };

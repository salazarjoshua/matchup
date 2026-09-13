import { UploadImageIcon } from "@/components/icons";
import { cn } from "@/utils/cn";
import type { ComponentPropsWithoutRef } from "react";

type DropOverlayProps = Omit<ComponentPropsWithoutRef<"div">, "children">;

const DropOverlay = ({ className, ...props }: DropOverlayProps) => (
  <div className=" z-30 absolute inset-0 p-2 bg-white grid place-items-center pointer-events-none">
    <div
      className={cn(
        "size-full grid place-items-center rounded-xl",
        "border-2 border-dashed border-accent-blue bg-[#F2F9FF]",
        className,
      )}
      {...props}
    >
      <div className="text-accent-blue flex flex-col items-center gap-1">
        <UploadImageIcon className="w-7" />
        <span className="text-sm font-semibold">Drop to add a layer</span>
      </div>
    </div>
  </div>
);

export { DropOverlay };
export type { DropOverlayProps };

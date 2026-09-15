import { UploadImageIcon } from "@/components/icons";
import { cn } from "@/utils/cn";
import type { ComponentPropsWithoutRef } from "react";

type DropOverlayProps = Omit<ComponentPropsWithoutRef<"div">, "children">;

const DropOverlay = ({ className, ...props }: DropOverlayProps) => (
  <div
    className={cn(
      "absolute inset-0 z-30 grid place-items-center bg-white p-2",
      // Must never take the pointer: a dragleave fired by the overlay itself would
      // flicker the zone off under the cursor. Inherited by everything below.
      "pointer-events-none",
      className,
    )}
    {...props}
  >
    <div className="border-accent-blue bg-accent-blue/5 grid size-full place-items-center rounded-xl border-2 border-dashed">
      <div className="text-accent-blue flex flex-col items-center gap-1">
        <UploadImageIcon className="w-7" />
        <span className="text-sm font-semibold">drop it like it's hot</span>
      </div>
    </div>
  </div>
);

export { DropOverlay };
export type { DropOverlayProps };

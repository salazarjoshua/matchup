import { UploadImageIcon } from "@/components/icons";
import { cn } from "@/utils/cn";
import type { ComponentPropsWithoutRef } from "react";

type DropOverlayProps = Omit<ComponentPropsWithoutRef<"div">, "children">;

/**
 * Yellow marks content arriving from outside, the way the paste tile does; blue stays
 * with placing layers already here. The scrim keeps the copy legible over a full grid,
 * and the glyph is ink because yellow carries neither text nor icons anywhere else.
 */
const DropOverlay = ({ className, ...props }: DropOverlayProps) => (
  <div
    className={cn(
      "absolute inset-2 z-30 grid place-items-center rounded-xl",
      "border-[1.5px] border-dashed border-accent-yellow bg-white/85",
      // Must never take the pointer: a dragleave fired by the overlay itself
      // would flicker the zone off under the cursor.
      "pointer-events-none",
      className,
    )}
    {...props}
  >
    <div className="text-ink flex flex-col items-center gap-1">
      <UploadImageIcon className="w-6" />
      <span className="text-micro">Drop to add a layer</span>
    </div>
  </div>
);

export { DropOverlay };
export type { DropOverlayProps };

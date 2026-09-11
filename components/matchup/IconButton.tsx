import { cn } from "@/utils/cn";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type IconButtonProps = ComponentPropsWithoutRef<"button"> & {
  children: ReactNode;
};

/** A bare icon-only button. Used by the title bar and by the panel around it. */
const IconButton = ({ className, children, ...props }: IconButtonProps) => (
  <button
    type="button"
    className={cn(
      "size-icon-btn rounded-icon text-muted duration-120 grid place-items-center transition-colors ease-out",
      "hover:bg-surface-hover",
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

export { IconButton };
export type { IconButtonProps };

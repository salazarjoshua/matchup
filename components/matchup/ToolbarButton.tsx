import { cn } from "@/utils/cn";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type ToolbarButtonProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "children"
> & { children: ReactNode };

/** The toolbar's dark tile. Width, corners and hover belong to the caller. */
const ToolbarButton = ({
  className,
  children,
  ...props
}: ToolbarButtonProps) => (
  <button
    type="button"
    className={cn(
      "h-10 duration-120 grid place-items-center transition-colors ease-out",
      "bg-toolbar text-muted",
      props.disabled && "cursor-not-allowed",
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

export { ToolbarButton };
export type { ToolbarButtonProps };

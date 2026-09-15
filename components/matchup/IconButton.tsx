import { cn } from "@/utils/cn";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type IconButtonProps = ComponentPropsWithoutRef<"button"> & {
  children: ReactNode;
};

const IconButton = ({ className, children, ...props }: IconButtonProps) => (
  <button
    type="button"
    className={cn(
      "size-7 rounded-[10px] text-muted duration-120 grid place-items-center transition-colors ease-out",
      "hover:bg-surface",
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

export { IconButton };

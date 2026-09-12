import { cn } from "@/utils/cn";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type ToolbarProps = ComponentPropsWithoutRef<"div"> & { children: ReactNode };

const Toolbar = ({ className, children, ...props }: ToolbarProps) => (
  <div
    className={cn("w-panel flex flex-none items-center gap-1", className)}
    {...props}
  >
    {children}
  </div>
);

export { Toolbar };
export type { ToolbarProps };

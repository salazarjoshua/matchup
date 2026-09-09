import { cn } from "@/utils/cn";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type RailProps = ComponentPropsWithoutRef<"div"> & { children: ReactNode };

const Rail = ({ className, children, ...props }: RailProps) => (
  <div
    className={cn("w-panel flex flex-none items-center gap-1", className)}
    {...props}
  >
    {children}
  </div>
);

export { Rail };
export type { RailProps };

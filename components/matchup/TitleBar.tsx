import { cn } from "@/utils/cn";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { LogoLockup } from "../icons";

type TitleBarProps = ComponentPropsWithoutRef<"div"> & { actions?: ReactNode };

const TitleBar = ({ className, actions, ...props }: TitleBarProps) => (
  <div
    className={cn(
      "h-10 border-hairline flex items-center gap-2 border-b pl-3 pr-1.5",
      className,
    )}
    {...props}
  >
    <div className="text-ink">
      <LogoLockup className="h-4 -mb-1" />
    </div>
    {actions && <span className="ml-auto flex items-center">{actions}</span>}
  </div>
);

export { TitleBar };
export type { TitleBarProps };

import { cn } from "@/utils/cn";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type IconButtonProps = ComponentPropsWithoutRef<"button"> & {
  children: ReactNode;
};

const IconButton = ({ className, children, ...props }: IconButtonProps) => (
  <button
    type="button"
    className={cn(
      "size-icon-btn rounded-icon text-muted duration-120 grid place-items-center transition-colors ease-out",
      "hover:bg-surface-hover focus-visible:ring-[1.5px] focus-visible:ring-accent-blue focus-visible:outline-none",
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

type TitleBarProps = ComponentPropsWithoutRef<"div"> & { actions?: ReactNode };

const TitleBar = ({ className, actions, ...props }: TitleBarProps) => (
  <div
    className={cn(
      "h-title-bar border-hairline flex items-center gap-2 border-b px-3",
      className,
    )}
    {...props}
  >
    <span className="text-[15px] leading-none">🥊</span>
    <span className="text-panel-title text-ink font-sans">Matchup</span>
    {actions && (
      <span className="ml-auto flex items-center gap-1">{actions}</span>
    )}
  </div>
);

export { TitleBar, IconButton };
export type { TitleBarProps, IconButtonProps };

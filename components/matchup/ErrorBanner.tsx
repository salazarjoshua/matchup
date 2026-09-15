import { WarningIcon, XIcon } from "@/components/icons";
import { cn } from "@/utils/cn";
import type { ComponentPropsWithoutRef } from "react";

type ErrorBannerProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  message: string;
  onDismiss?: () => void;
};

const ErrorBanner = ({
  message,
  onDismiss,
  className,
  ...props
}: ErrorBannerProps) => (
  <div className={cn("px-3 pt-3", className)} {...props}>
    <div
      role="alert"
      className="rounded-xl bg-accent-red flex items-start gap-1.5 px-3 py-2.5 font-sans text-[11px]/4 text-white"
    >
      <span className="grid h-4 flex-none place-items-center">
        <WarningIcon className="w-4" />
      </span>
      <span className="flex-1 line-clamp-2">{message}</span>
      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className="box-content grid h-4 flex-none place-items-center rounded-sm px-3 py-2.5 -my-2.5 -mr-3"
        >
          <XIcon className="w-3" />
        </button>
      )}
    </div>
  </div>
);

export { ErrorBanner };
export type { ErrorBannerProps };

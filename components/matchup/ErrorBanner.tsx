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
  <div
    role="alert"
    className={cn(
      "rounded-xl bg-accent-red/8 mx-3 mt-3 flex items-center gap-2 px-3 py-2.5",
      className,
    )}
    {...props}
  >
    <span className="text-error mt-px flex-none">
      <WarningIcon className="w-4" />
    </span>
    <span className="text-error flex-1 font-sans text-[11px] leading-[1.4]">
      {message}
    </span>
    {onDismiss && (
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="text-error -mr-1 mt-px flex-none rounded-sm p-0.5"
      >
        <XIcon className="w-3" />
      </button>
    )}
  </div>
);

export { ErrorBanner };
export type { ErrorBannerProps };

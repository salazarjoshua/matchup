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
      "rounded-xl bg-accent-red mx-3 mt-3 -mb-1 flex items-center gap-1.5 px-3 py-2.5",
      className,
    )}
    {...props}
  >
    <span className="text-white mt-px flex-none">
      <WarningIcon className="w-4" />
    </span>
    <span className="text-white flex-1 font-sans text-[11px]/[1.2]">
      {message}
    </span>
    {onDismiss && (
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="text-white flex-none rounded-sm h-full
          px-3 py-2.5 -mx-3 -my-2.5
          "
      >
        <XIcon className="w-3" />
      </button>
    )}
  </div>
);

export { ErrorBanner };
export type { ErrorBannerProps };

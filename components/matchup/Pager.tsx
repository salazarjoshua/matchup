import { CaretLeftIcon, CaretRightIcon } from "@/components/icons";
import { cn } from "@/utils/cn";
import type { ComponentPropsWithoutRef } from "react";

type PagerProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  page: number;
  pageCount: number;
  onPrev?: () => void;
  onNext?: () => void;
};

type PagerButtonProps = ComponentPropsWithoutRef<"button"> & {
  enabled: boolean;
};

const PagerButton = ({
  enabled,
  className,
  children,
  ...props
}: PagerButtonProps) => (
  <button
    type="button"
    disabled={!enabled}
    className={cn(
      "size-5 rounded-icon duration-120 grid place-items-center transition-colors ease-out",
      "focus-visible:ring-[1.5px] focus-visible:ring-accent-blue focus-visible:outline-none",
      enabled
        ? "text-ink hover:bg-surface-track"
        : "cursor-not-allowed text-disabled",
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

const Pager = ({
  page,
  pageCount,
  onPrev,
  onNext,
  className,
  ...props
}: PagerProps) => (
  <div
    className={cn("flex items-center justify-end gap-px", className)}
    {...props}
  >
    <PagerButton enabled={page > 1} onClick={onPrev} aria-label="Previous page">
      <CaretLeftIcon className="w-3" />
    </PagerButton>
    <span className="text-micro text-muted tabular-nums font-mono">{`${page}/${pageCount}`}</span>
    <PagerButton
      enabled={page < pageCount}
      onClick={onNext}
      aria-label="Next page"
    >
      <CaretRightIcon className="w-3" />
    </PagerButton>
  </div>
);

export { Pager, PagerButton };
export type { PagerProps };

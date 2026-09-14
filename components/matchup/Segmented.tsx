import { cn } from "@/utils/cn";
import type { ComponentPropsWithoutRef } from "react";

type SegmentedOption = { value: string; label: string };

type SegmentedProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "onChange"
> & {
  options: readonly SegmentedOption[];
  value: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
};

/**
 * A two-or-more way switch that names every state, for a choice where an on/off
 * control would only name one of them — "not pinned" says nothing about what the
 * layer does instead.
 */
const Segmented = ({
  options,
  value,
  disabled = false,
  onChange,
  className,
  ...props
}: SegmentedProps) => (
  <div
    role="radiogroup"
    className={cn(
      "h-8 rounded-xl bg-surface flex items-center gap-1 p-1",
      className,
    )}
    {...props}
  >
    {options.map((option) => {
      const active = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={active}
          disabled={disabled}
          onClick={() => onChange?.(option.value)}
          className={cn(
            "duration-120 h-full flex-1 rounded-lg text-[12px] transition-colors ease-out",
            // White on a hairline is this panel's mark for a live surface — the
            // same treatment the X/Y fields carry a few pixels below.
            active && "border-hairline border bg-white",
            // The raise is the whole signal for which one is on, so it goes when
            // the block is disabled: a frozen layer shouldn't read as a live choice.
            active && !disabled && "text-ink shadow-panel",
            !active && !disabled && "text-muted hover:text-ink",
            disabled && "cursor-not-allowed text-disabled",
          )}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export { Segmented };
export type { SegmentedProps, SegmentedOption };

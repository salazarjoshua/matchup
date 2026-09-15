import { cn } from "@/utils/cn";
import type { ComponentPropsWithoutRef } from "react";

type AnchorPadProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "onSelect"
> & {
  /** Index 0–8 of the active snap point, or null when no anchor is set. */
  selected: number | null;
  disabled?: boolean;
  onSelect?: (index: number) => void;
};

const AnchorPad = ({
  selected,
  disabled = false,
  onSelect,
  className,
  ...props
}: AnchorPadProps) => (
  <div
    className={cn(
      "size-24 rounded-xl bg-surface grid flex-none grid-cols-3 grid-rows-3 place-items-center",
      className,
    )}
    {...props}
  >
    {Array.from({ length: 9 }, (_, i) => {
      const active = i === selected;
      return (
        <button
          key={i}
          type="button"
          aria-label={`Anchor ${i + 1}`}
          aria-pressed={active}
          disabled={disabled}
          onClick={() => onSelect?.(i)}
          className="size-full grid place-items-center rounded-xl"
        >
          <span
            className={cn(
              active ? "size-4 rounded-md" : "size-1 rounded-full",
              active && (disabled ? "bg-accent-blue/40" : "bg-accent-blue"),
              !active && (disabled ? "bg-disabled/60" : "bg-placeholder"),
            )}
          />
        </button>
      );
    })}
  </div>
);

export { AnchorPad };
export type { AnchorPadProps };

import { cn } from "@/utils/cn";
import { useState } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type FieldProps = Omit<ComponentPropsWithoutRef<"label">, "onChange"> & {
  /** Field label — 'X', 'Y', or an icon for scale. */
  label?: ReactNode;
  value: string | number;
  disabled?: boolean;
  onChange?: (value: string) => void;
  /** Arrow-key increment; Shift multiplies it by ten. */
  step?: number;
  /**
   * Lower bound. Omitted for X and Y, which are legitimately negative; set for
   * scale, where a negative multiplier mirrors the overlay on both axes and
   * throws it off-screen, and where 0 is read as 1x by `Number(v) || 1`.
   */
  min?: number;
};

/** Keeps a partial entry like "-" or "1." usable while still rejecting non-numeric input. */
const toNumeric = (raw: string, allowNegative: boolean) => {
  const negative = allowNegative && raw.trimStart().startsWith("-");
  const [whole, ...rest] = raw.replace(/[^0-9.]/g, "").split(".");
  return `${negative ? "-" : ""}${whole}${rest.length ? `.${rest.join("")}` : ""}`;
};

const Field = ({
  label,
  value,
  disabled = false,
  onChange,
  step = 1,
  min,
  className,
  ...props
}: FieldProps) => {
  const [focused, setFocused] = useState(false);
  const interactive = !disabled && Boolean(onChange);
  const bounded = min !== undefined;

  // A label rather than a div: it names the input for a screen reader without an id
  // to wire up, and clicking anywhere in the box puts the caret in the number.
  return (
    <label
      className={cn(
        "h-10 rounded-xl duration-120 flex items-center gap-2 transition-colors ease-out",
        "px-3 border-0 bg-surface",
        focused && interactive
          ? "focus-within:ring-2 focus-within:ring-focus"
          : disabled
            ? "border-transparent"
            : "border-hairline",
        className,
      )}
      {...props}
    >
      {label && (
        <span
          className={cn(
            // Sized to its own glyph rather than to a column: two fields share a
            // row now, and a fixed label ate the width the number needed.
            "flex-none text-[12px]",
            disabled ? "text-disabled" : "text-muted",
          )}
        >
          {label}
        </span>
      )}
      {interactive ? (
        <input
          value={value}
          inputMode="decimal"
          onChange={(event) =>
            onChange?.(
              toNumeric(event.currentTarget.value, !bounded || min < 0),
            )
          }
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            // Snapped on the way out rather than per keystroke, so typing "0.5"
            // isn't fought character by character. An emptied field lands here
            // too, which is why it is a floor and not just a negative check.
            if (!bounded) return;
            const entered = Number(value);
            if (!Number.isFinite(entered) || entered < min) {
              onChange?.(String(min));
            }
          }}
          onKeyDown={(event) => {
            const direction =
              event.key === "ArrowUp" ? 1 : event.key === "ArrowDown" ? -1 : 0;
            if (direction === 0) return;
            event.preventDefault();
            const delta = direction * step * (event.shiftKey ? 10 : 1);
            const stepped = (Number(value) || 0) + delta;
            const next = bounded ? Math.max(min, stepped) : stepped;
            // Trims float noise from decimal steps without losing real precision.
            onChange?.(String(Number(next.toFixed(4))));
          }}
          className="text-sm text-ink min-w-0 flex-1 tabular-nums outline-none focus-visible:ring-0"
        />
      ) : (
        <span
          className={cn(
            "text-sm flex-1 tabular-nums",
            disabled ? "text-disabled cursor-not-allowed" : "text-muted",
          )}
        >
          {value}
        </span>
      )}
    </label>
  );
};

export { Field };

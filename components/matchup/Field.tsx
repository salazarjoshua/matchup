import { cn } from "@/utils/cn";
import { useState } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type FieldProps = Omit<ComponentPropsWithoutRef<"div">, "onChange"> & {
  /** Field label — 'X', 'Y', or an icon for scale. */
  label?: ReactNode;
  value: string | number;
  editable?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
  /** Arrow-key increment; Shift multiplies it by ten. */
  step?: number;
};

/** Keeps a partial entry like "-" or "1." usable while still rejecting non-numeric input. */
const toNumeric = (raw: string) => {
  const negative = raw.trimStart().startsWith("-");
  const [whole, ...rest] = raw.replace(/[^0-9.]/g, "").split(".");
  return `${negative ? "-" : ""}${whole}${rest.length ? `.${rest.join("")}` : ""}`;
};

const Field = ({
  label,
  value,
  editable = false,
  disabled = false,
  onChange,
  step = 1,
  className,
  ...props
}: FieldProps) => {
  const [focused, setFocused] = useState(false);
  const interactive = editable && !disabled && Boolean(onChange);

  return (
    <div
      className={cn(
        "h-control rounded-control duration-120 flex items-center gap-2 transition-colors ease-out",
        focused && interactive
          ? "border-[1.5px] border-accent-blue bg-white px-[11.5px]"
          : editable && !disabled
            ? "border-hairline border bg-white px-3"
            : "bg-surface border border-transparent px-3",
        className,
      )}
      {...props}
    >
      {label && (
        <span
          className={cn(
            "w-6 font-mono text-[12px]",
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
          onChange={(event) => onChange?.(toNumeric(event.currentTarget.value))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(event) => {
            // Up/Down step the value. Left/Right stay with the caret.
            const direction =
              event.key === "ArrowUp" ? 1 : event.key === "ArrowDown" ? -1 : 0;
            if (direction === 0) return;
            event.preventDefault();
            const delta = direction * step * (event.shiftKey ? 10 : 1);
            const next = (Number(value) || 0) + delta;
            // Trims float noise from decimal steps without losing real precision.
            onChange?.(String(Number(next.toFixed(4))));
          }}
          className="text-value text-ink min-w-0 flex-1 bg-transparent font-mono outline-none"
        />
      ) : (
        <span
          className={cn(
            "text-value flex-1 font-mono",
            disabled ? "text-disabled" : "text-muted",
          )}
        >
          {value}
        </span>
      )}
    </div>
  );
};

export { Field };
export type { FieldProps };

import { clampPercent } from "@/utils/clamp";
import { cn } from "@/utils/cn";
import { useRef, useState } from "react";
import type {
  ComponentPropsWithoutRef,
  KeyboardEvent,
  PointerEvent,
} from "react";

type OpacityBarProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "onChange"
> & {
  /** 0–100. */
  value: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
};

/** Every 10%, skipping the ends so nothing sits under the rounded corners. */
const TICKS = [10, 20, 30, 40, 50, 60, 70, 80, 90];

const OpacityBar = ({
  value,
  disabled = false,
  onChange,
  className,
  ...props
}: OpacityBarProps) => {
  const track = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const commitDraft = () => {
    setEditing(false);
    if (draft.trim() === "") return;
    onChange?.(clampPercent(Number(draft)));
  };

  const setFromClientX = (clientX: number) => {
    const el = track.current;
    if (!el || disabled) return;
    const rect = el.getBoundingClientRect();
    onChange?.(clampPercent(((clientX - rect.left) / rect.width) * 100));
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromClientX(event.clientX);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || !event.currentTarget.hasPointerCapture(event.pointerId))
      return;
    setFromClientX(event.clientX);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const step = event.shiftKey ? 10 : 1;
    const delta =
      event.key === "ArrowRight" || event.key === "ArrowUp"
        ? step
        : event.key === "ArrowLeft" || event.key === "ArrowDown"
          ? -step
          : 0;
    if (delta === 0) return;
    event.preventDefault();
    onChange?.(clampPercent(value + delta));
  };

  return (
    <div className={cn("flex items-center gap-3", className)} {...props}>
      <div
        ref={track}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label="Overlay opacity"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-disabled={disabled}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onKeyDown={onKeyDown}
        className={cn(
          "h-control rounded-control bg-surface group relative flex-1 overflow-hidden",
          "focus-visible:ring-[1.5px] focus-visible:ring-accent-blue focus-visible:outline-none",
          !disabled && "cursor-pointer",
        )}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0",
            disabled ? "bg-disabled" : "bg-accent-blue",
          )}
          style={{ width: `${value}%` }}
        />
        {!disabled &&
          TICKS.map((tick) => (
            <span
              key={tick}
              // Each tick colours itself for the ground it sits on, so the blue fill
              // and the grey track both stay legible without clipping tricks.
              className={cn(
                "pointer-events-none absolute top-1/2 h-2.5 w-px -translate-y-1/2 rounded-full",
                "opacity-0 transition-opacity duration-120 ease-out",
                "group-hover:opacity-100 group-focus-visible:opacity-100",
                tick <= value ? "bg-white/55" : "bg-ink/15",
              )}
              style={{ left: `${tick}%` }}
            />
          ))}
        <div
          className="pointer-events-none absolute inset-y-1.75 -ml-1.75 w-1 rounded-full bg-white"
          style={{ left: `clamp(4px, ${value}%, calc(100% - 4px))` }}
        />
      </div>
      {editing && !disabled ? (
        <input
          autoFocus
          value={draft}
          inputMode="numeric"
          aria-label="Overlay opacity value"
          onChange={(event) =>
            setDraft(event.currentTarget.value.replace(/[^0-9]/g, ""))
          }
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") setEditing(false);
            // The track's arrow handling shouldn't fight the caret.
            event.stopPropagation();
          }}
          className="text-value text-ink w-10 bg-transparent text-right tabular-nums outline-none"
        />
      ) : (
        <button
          type="button"
          disabled={disabled}
          aria-label="Edit opacity value"
          onClick={() => {
            setDraft(String(value));
            setEditing(true);
          }}
          className={cn(
            "text-value w-10 text-right tabular-nums",
            "focus-visible:ring-[1.5px] focus-visible:ring-accent-blue rounded-[3px] focus-visible:outline-none",
            disabled ? "text-disabled" : "text-ink hover:text-accent-blue",
          )}
        >
          {value}%
        </button>
      )}
    </div>
  );
};

export { OpacityBar };
export type { OpacityBarProps };

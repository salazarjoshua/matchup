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
  value: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
};

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
          "h-10 rounded-xl bg-surface group relative flex-1 overflow-hidden",
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
              className={cn(
                "pointer-events-none absolute top-1/2 h-1.5 w-px -translate-y-1/2 rounded-full",
                "transition-height duration-120 ease-out",
                "group-hover:h-2.5 group-focus-visible:h-2.5",
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
            const direction =
              event.key === "ArrowUp" ? 1 : event.key === "ArrowDown" ? -1 : 0;
            if (direction !== 0) {
              event.preventDefault();
              const from = draft.trim() === "" ? value : Number(draft);
              const next = clampPercent(
                from + direction * (event.shiftKey ? 10 : 1),
              );
              setDraft(String(next));
              onChange?.(next);
            }
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") setEditing(false);
            event.stopPropagation();
          }}
          className="text-sm text-ink w-10 bg-transparent text-right tabular-nums rounded-sm"
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
            "text-sm w-10 text-right tabular-nums rounded-sm",
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

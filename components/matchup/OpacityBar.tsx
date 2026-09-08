import { cn } from "@/utils/cn";
import { useRef } from "react";
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

const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

const OpacityBar = ({
  value,
  disabled = false,
  onChange,
  className,
  ...props
}: OpacityBarProps) => {
  const track = useRef<HTMLDivElement>(null);

  const setFromClientX = (clientX: number) => {
    const el = track.current;
    if (!el || disabled) return;
    const rect = el.getBoundingClientRect();
    onChange?.(clamp(((clientX - rect.left) / rect.width) * 100));
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
    onChange?.(clamp(value + delta));
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
          "h-control rounded-control group relative flex-1 overflow-hidden",
          "focus-visible:ring-[1.5px] focus-visible:ring-accent-blue focus-visible:outline-none",
          disabled ? "bg-surface" : "bg-surface-track cursor-pointer",
        )}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0",
            disabled ? "bg-disabled" : "bg-accent-blue",
          )}
          style={{ width: `${value}%` }}
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-y-1.25 -ml-0.5 w-1 rounded-[3px] bg-white",
            !disabled &&
              "group-hover:ring-accent-blue/[.22] group-hover:w-1.5 group-hover:ring-4",
          )}
          style={{ left: `clamp(4px, ${value}%, calc(100% - 8px))` }}
        />
      </div>
      <span
        className={cn(
          "text-value w-10 text-right font-mono",
          disabled ? "text-disabled" : "text-ink",
        )}
      >
        {value}%
      </span>
    </div>
  );
};

export { OpacityBar };
export type { OpacityBarProps };

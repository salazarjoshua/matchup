import { cn } from "@/utils/cn";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type RailToggleProps = Omit<ComponentPropsWithoutRef<"button">, "children"> & {
  accent: "blue" | "orange" | "yellow";
  on: boolean;
  children: ReactNode;
};

const accentFill = {
  blue: "bg-accent-blue",
  orange: "bg-accent-orange",
  yellow: "bg-accent-yellow",
} as const;

// Blue is dark enough to carry a white glyph; orange and yellow need ink.
const accentGlyph = {
  blue: "text-white",
  orange: "text-ink",
  yellow: "text-ink",
} as const;

const RailToggle = ({
  accent,
  on,
  className,
  children,
  ...props
}: RailToggleProps) => (
  <button
    aria-pressed={on}
    className={cn(
      "h-rail-tile duration-120 grid flex-1 place-items-center transition-colors ease-out",
      "focus-visible:ring-[1.5px] focus-visible:ring-accent-blue focus-visible:outline-none",
      props.disabled
        ? // Design system §06: disabled controls drop to the surface with disabled text,
          // which also stops them reading identically to a toggle that is merely off.
          "bg-surface text-disabled cursor-not-allowed"
        : on
          ? [accentFill[accent], accentGlyph[accent]]
          : "bg-rail-tile hover:bg-rail-tile-hover text-muted",
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

export { RailToggle };
export type { RailToggleProps };

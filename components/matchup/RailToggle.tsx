import { cn } from "@/utils/cn";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type RailToggleProps = Omit<ComponentPropsWithoutRef<"button">, "children"> & {
  accent: "blue" | "yellow" | "pink";
  on: boolean;
  children: ReactNode;
};

const accentFill = {
  blue: "bg-accent-blue",
  yellow: "bg-accent-yellow",
  pink: "bg-accent-pink",
} as const;

// Blue is dark enough to carry a white glyph; yellow and pink need ink.
const accentGlyph = {
  blue: "text-white",
  yellow: "text-ink",
  pink: "text-ink",
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
      "h-10 duration-120 grid flex-1 place-items-center transition-colors ease-out",
      "bg-rail",
      props.disabled
        ? // Keeps the rail tile ground but refuses the pointer, so a disabled toggle
          // never reads as one that is merely off. Unreachable today: MatchupPanel only
          // renders the rail toggles once a layer is selected, and never disables them.
          "text-muted cursor-not-allowed"
        : on
          ? [accentFill[accent], accentGlyph[accent]]
          : "hover:bg-rail-hover text-muted",
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

export { RailToggle };
export type { RailToggleProps };

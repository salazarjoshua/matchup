import { ToolbarButton } from "./ToolbarButton";
import { cn } from "@/utils/cn";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type ToolbarToggleProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "children"
> & {
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

const ToolbarToggle = ({
  accent,
  on,
  className,
  children,
  ...props
}: ToolbarToggleProps) => (
  <ToolbarButton
    aria-pressed={on}
    className={cn(
      "flex-1",
      on ? [accentFill[accent], accentGlyph[accent]] : "hover:bg-toolbar-hover",
      className,
    )}
    {...props}
  >
    {children}
  </ToolbarButton>
);

export { ToolbarToggle };

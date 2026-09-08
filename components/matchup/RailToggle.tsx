import { cn } from '@/utils/cn';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type RailToggleProps = Omit<ComponentPropsWithoutRef<'button'>, 'children'> & {
  accent: 'blue' | 'orange' | 'yellow';
  on: boolean;
  children: ReactNode;
};

const accentFill = {
  blue: 'bg-accent-blue',
  orange: 'bg-accent-orange',
  yellow: 'bg-accent-yellow',
} as const;

// Blue is dark enough to carry a white glyph; orange and yellow need ink.
const accentGlyph = {
  blue: 'text-white',
  orange: 'text-ink',
  yellow: 'text-ink',
} as const;

const RailToggle = ({ accent, on, className, children, ...props }: RailToggleProps) => (
  <button
    type="button"
    aria-pressed={on}
    className={cn(
      'size-rail-tile rounded-control duration-[120ms] grid place-items-center transition-colors ease-out',
      'focus-visible:ring-[1.5px] focus-visible:ring-accent-blue focus-visible:outline-none',
      on
        ? [accentFill[accent], accentGlyph[accent], 'ring-2 ring-white/[.28]']
        : 'bg-rail-tile hover:bg-rail-tile-hover text-white/50',
      className,
    )}
    {...props}>
    {children}
  </button>
);

export { RailToggle };
export type { RailToggleProps };

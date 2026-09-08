import { cn } from '@/utils/cn';
import type { ComponentPropsWithoutRef } from 'react';

type AnchorPadProps = Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'onSelect'> & {
  /** Index 0–8 of the active snap point, or null when no anchor is set. */
  selected: number | null;
  disabled?: boolean;
  onSelect?: (index: number) => void;
};

const AnchorPad = ({ selected, disabled = false, onSelect, className, ...props }: AnchorPadProps) => (
  <div
    className={cn(
      'size-anchor rounded-control bg-surface grid flex-none grid-cols-3 grid-rows-3 place-items-center',
      className,
    )}
    {...props}>
    {Array.from({ length: 9 }, (_, i) =>
      i === selected ? (
        <button
          key={i}
          type="button"
          aria-label={`Anchor ${i + 1}`}
          aria-pressed
          disabled={disabled}
          onClick={() => onSelect?.(i)}
          className={cn('size-4 rounded-[4px]', disabled ? 'bg-accent-blue/40' : 'bg-accent-blue')}
        />
      ) : (
        <button
          key={i}
          type="button"
          aria-label={`Anchor ${i + 1}`}
          aria-pressed={false}
          disabled={disabled}
          onClick={() => onSelect?.(i)}
          className={cn('size-1 rounded-full', disabled ? 'bg-disabled/60' : 'bg-placeholder')}
        />
      ),
    )}
  </div>
);

export { AnchorPad };
export type { AnchorPadProps };

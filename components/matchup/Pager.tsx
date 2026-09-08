import { CaretLeftIcon, CaretRightIcon } from '@/components/icons';
import { cn } from '@/utils/cn';
import type { ComponentPropsWithoutRef } from 'react';

type PagerProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  page: number;
  pageCount: number;
  onPrev?: () => void;
  onNext?: () => void;
};

type PagerButtonProps = ComponentPropsWithoutRef<'button'> & { enabled: boolean };

const PagerButton = ({ enabled, className, children, ...props }: PagerButtonProps) => (
  <button
    type="button"
    disabled={!enabled}
    className={cn(
      'size-icon-btn rounded-icon duration-120 grid place-items-center transition-colors ease-out',
      'focus-visible:ring-[1.5px] focus-visible:ring-accent-blue focus-visible:outline-none',
      enabled ? 'bg-surface text-ink hover:bg-surface-track' : 'bg-canvas text-disabled',
      className,
    )}
    {...props}>
    {children}
  </button>
);

const Pager = ({ page, pageCount, onPrev, onNext, className, ...props }: PagerProps) => (
  <div className={cn('flex items-center gap-2', className)} {...props}>
    <span className="text-meta text-muted font-mono">{`${page} / ${pageCount}`}</span>
    <span className="ml-auto flex items-center gap-2">
      <PagerButton enabled={page > 1} onClick={onPrev} aria-label="Previous page">
        <CaretLeftIcon className="w-3.25" />
      </PagerButton>
      <PagerButton enabled={page < pageCount} onClick={onNext} aria-label="Next page">
        <CaretRightIcon className="w-3.25" />
      </PagerButton>
    </span>
  </div>
);

export { Pager, PagerButton };
export type { PagerProps };

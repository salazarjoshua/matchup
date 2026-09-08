import { WarningCircleIcon, XIcon } from '@/components/icons';
import { cn } from '@/utils/cn';
import type { ComponentPropsWithoutRef } from 'react';

type ErrorBannerProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  message: string;
  onDismiss?: () => void;
};

const ErrorBanner = ({ message, onDismiss, className, ...props }: ErrorBannerProps) => (
  <div
    role="alert"
    className={cn('rounded-control bg-error-bg mx-3 mt-3 flex items-start gap-2 px-3 py-2.5', className)}
    {...props}>
    <span className="text-error-icon mt-px flex-none">
      <WarningCircleIcon size={16} />
    </span>
    <span className="text-error-ink flex-1 font-sans text-[11px] leading-[1.4]">{message}</span>
    {onDismiss && (
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="text-error-icon -mr-1 mt-px flex-none rounded-[4px] p-0.5 hover:bg-black/5">
        <XIcon size={12} strokeWidth={2.6} />
      </button>
    )}
  </div>
);

export { ErrorBanner };
export type { ErrorBannerProps };

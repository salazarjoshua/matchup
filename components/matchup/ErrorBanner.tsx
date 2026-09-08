import { WarningCircleIcon } from '@/components/icons';
import { cn } from '@/utils/cn';
import type { ComponentPropsWithoutRef } from 'react';

type ErrorBannerProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & { message: string };

const ErrorBanner = ({ message, className, ...props }: ErrorBannerProps) => (
  <div
    role="alert"
    className={cn('rounded-control bg-error-bg mx-3 mt-3 flex items-start gap-2 px-3 py-2.5', className)}
    {...props}>
    <span className="text-error-icon mt-px flex-none">
      <WarningCircleIcon size={16} />
    </span>
    <span className="text-error-ink font-sans text-[11px] leading-[1.4]">{message}</span>
  </div>
);

export { ErrorBanner };
export type { ErrorBannerProps };

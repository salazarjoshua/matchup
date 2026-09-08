import { cn } from '@/utils/cn';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type RailProps = ComponentPropsWithoutRef<'div'> & { children: ReactNode };

const RailGrip = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div
    className={cn('w-rail-tile grid h-6 cursor-grab grid-cols-3 grid-rows-2 place-content-center gap-1', className)}
    {...props}>
    {Array.from({ length: 6 }, (_, i) => (
      <span key={i} className="size-1 rounded-full bg-white/[.38]" />
    ))}
  </div>
);

const RailDivider = () => <div className="h-px w-6 bg-white/[.16]" />;

const Rail = ({ className, children, ...props }: RailProps) => (
  <div
    className={cn(
      'w-rail rounded-panel border-hairline-dark bg-rail flex flex-none flex-col items-center gap-2 border py-3',
      className,
    )}
    {...props}>
    {children}
  </div>
);

export { Rail, RailGrip, RailDivider };
export type { RailProps };

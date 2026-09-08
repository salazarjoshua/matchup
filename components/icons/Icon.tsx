import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type IconProps = Omit<ComponentPropsWithoutRef<'svg'>, 'viewBox' | 'children'> & {
  /** 20 in the rail, 16 in the title bar, 13 inside badges and hover actions. */
  size?: number;
};

type IconShellProps = IconProps & { children: ReactNode };

const IconShell = ({ size = 20, strokeWidth = 2.2, children, ...props }: IconShellProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="block"
    {...props}>
    {children}
  </svg>
);

export { IconShell };
export type { IconProps };

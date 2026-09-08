import type { ComponentPropsWithoutRef } from 'react';

export type IconProps = Omit<ComponentPropsWithoutRef<'svg'>, 'viewBox'> & {
  /** 20 in the rail, 16 in the title bar, 13 inside badges and hover actions. */
  size?: number;
};

/** Shared defaults for outlined icons. Override any of them inline on the icon. */
const stroked = (size = 20) =>
  ({
    viewBox: '0 0 24 24',
    width: size,
    height: size,
    className: 'block',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }) as const;

/** Shared defaults for solid icons whose path already describes the filled shape. */
const filled = (size = 20) =>
  ({
    viewBox: '0 0 24 24',
    width: size,
    height: size,
    className: 'block',
    fill: 'currentColor',
    stroke: 'none',
  }) as const;

/** Active rail icons flip to solid on the accent fill. */
type SolidIconProps = IconProps & { solid?: boolean };

export const EyeIcon = ({ size, solid = true, ...props }: SolidIconProps) => (
  <svg {...stroked(size)} {...props}>
    <ellipse cx="12" cy="12" rx="9.5" ry="6" />
    <circle cx="12" cy="12" r="2.6" fill={solid ? 'currentColor' : 'none'} />
  </svg>
);

export const EyeSlashIcon = ({ size, ...props }: IconProps) => (
  <svg {...stroked(size)} {...props}>
    <ellipse cx="12" cy="12" rx="9.5" ry="6" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M4 20 20 4" />
  </svg>
);

export const LockSimpleIcon = ({ size, solid = false, ...props }: SolidIconProps) => (
  <svg {...stroked(size)} {...props}>
    <rect
      x="4.5"
      y="10.5"
      width="15"
      height="9.5"
      rx="2.5"
      fill={solid ? 'currentColor' : 'none'}
      stroke={solid ? 'none' : undefined}
    />
    <path d="M8.2 10.5V8.2a3.8 3.8 0 0 1 7.6 0v2.3" />
  </svg>
);

export const LockOpenIcon = ({ size, ...props }: IconProps) => (
  <svg {...stroked(size)} {...props}>
    <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5" />
    <path d="M8.2 10.5V8.2a3.8 3.8 0 0 1 7.6 0" />
  </svg>
);

export const CircleHalfIcon = ({ size, ...props }: IconProps) => (
  <svg {...stroked(size)} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a9 9 0 0 0 0 18Z" fill="currentColor" stroke="none" />
  </svg>
);

export const SlidersHorizontalIcon = ({ size, ...props }: IconProps) => (
  <svg {...stroked(size)} {...props}>
    <path d="M3.5 8h17M3.5 16h17" />
    <circle cx="9" cy="8" r="2.4" fill="#fff" />
    <circle cx="15.5" cy="16" r="2.4" fill="#fff" />
  </svg>
);

export const InfoIcon = ({ size, ...props }: IconProps) => (
  <svg {...stroked(size)} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5" />
    <circle cx="12" cy="7.6" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const PencilSimpleIcon = ({ size, ...props }: IconProps) => (
  <svg {...filled(size)} {...props}>
    <path d="m21.31 6.878-4.188-4.19a1.5 1.5 0 0 0-2.122 0L3.44 14.25A1.49 1.49 0 0 0 3 15.31v4.19A1.5 1.5 0 0 0 4.5 21h4.19a1.49 1.49 0 0 0 1.06-.44L21.31 9a1.5 1.5 0 0 0 0-2.122M4.81 15l7.94-7.94 1.565 1.565-7.94 7.939zm-.31 1.81 2.69 2.69H4.5zM9 19.19l-1.565-1.565 7.94-7.94 1.565 1.565zm9-9L13.81 6l2.25-2.25 4.19 4.189z" />
  </svg>
);

export const TrashIcon = ({ size, ...props }: IconProps) => (
  <svg {...filled(size)} {...props}>
    <path d="M20.25 4.5H16.5v-.75a2.25 2.25 0 0 0-2.25-2.25h-4.5A2.25 2.25 0 0 0 7.5 3.75v.75H3.75a.75.75 0 0 0 0 1.5h.75v13.5A1.5 1.5 0 0 0 6 21h12a1.5 1.5 0 0 0 1.5-1.5V6h.75a.75.75 0 1 0 0-1.5M9 3.75A.75.75 0 0 1 9.75 3h4.5a.75.75 0 0 1 .75.75v.75H9zm9 15.75H6V6h12zm-7.5-9.75v6a.75.75 0 1 1-1.5 0v-6a.75.75 0 0 1 1.5 0m4.5 0v6a.75.75 0 1 1-1.5 0v-6a.75.75 0 1 1 1.5 0" />
  </svg>
);

export const XIcon = ({ size, ...props }: IconProps) => (
  <svg {...stroked(size)} {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const ArrowUpIcon = ({ size, ...props }: IconProps) => (
  <svg {...stroked(size)} {...props}>
    <path d="M12 19V5" />
    <path d="M6 11l6-6 6 6" />
  </svg>
);

// The design system draws both carets in a single 24px box as one paired specimen,
// which leaves each one off-centre on its own. Shifted to the viewBox centre here.
export const CaretLeftIcon = ({ size, ...props }: IconProps) => (
  <svg {...stroked(size)} {...props}>
    <path d="M14.5 5l-5 7 5 7" />
  </svg>
);

export const CaretRightIcon = ({ size, ...props }: IconProps) => (
  <svg {...stroked(size)} {...props}>
    <path d="M9.5 5l5 7-5 7" />
  </svg>
);

export const WarningCircleIcon = ({ size, ...props }: IconProps) => (
  <svg {...stroked(size)} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v6" />
    <circle cx="12" cy="16.8" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

/** Toggles the panel open and closed from the rail. */
export const GloveIcon = ({ size, ...props }: IconProps) => (
  <svg {...filled(size)} {...props}>
    <path d="M18.5 4.5A3.5 3.5 0 0 0 15 8v2h-1V6.5a3.5 3.5 0 0 0-7 0V14a6 6 0 0 0 1.2 3.6l.8 1.07V21a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.2l1.2-1.7A6 6 0 0 0 19 13.6V8a3.5 3.5 0 0 0-.5-3.5M9 6.5a1.5 1.5 0 0 1 3 0V12a1 1 0 0 0 2 0v-1h3v2.6a4 4 0 0 1-.75 2.34L15 17.8V20h-4v-2.2l-1.2-1.6A4 4 0 0 1 9 14z" />
  </svg>
);

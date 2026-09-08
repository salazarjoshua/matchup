import { IconShell } from "./Icon";
import type { IconProps } from "./Icon";

/** Active rail icons flip to solid on the accent fill. */
type SolidIconProps = IconProps & { solid?: boolean };

export const EyeIcon = ({ solid = true, ...props }: SolidIconProps) => (
  <IconShell {...props}>
    <ellipse cx="12" cy="12" rx="9.5" ry="6" />
    <circle cx="12" cy="12" r="2.6" fill={solid ? "currentColor" : "none"} />
  </IconShell>
);

export const EyeSlashIcon = (props: IconProps) => (
  <IconShell {...props}>
    <ellipse cx="12" cy="12" rx="9.5" ry="6" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M4 20 20 4" />
  </IconShell>
);

export const LockSimpleIcon = ({ solid = false, ...props }: SolidIconProps) => (
  <IconShell {...props}>
    <rect
      x="4.5"
      y="10.5"
      width="15"
      height="9.5"
      rx="2.5"
      fill={solid ? "currentColor" : "none"}
      stroke={solid ? "none" : undefined}
    />
    <path d="M8.2 10.5V8.2a3.8 3.8 0 0 1 7.6 0v2.3" />
  </IconShell>
);

export const LockOpenIcon = (props: IconProps) => (
  <IconShell {...props}>
    <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5" />
    <path d="M8.2 10.5V8.2a3.8 3.8 0 0 1 7.6 0" />
  </IconShell>
);

export const CircleHalfIcon = (props: IconProps) => (
  <IconShell {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a9 9 0 0 0 0 18Z" fill="currentColor" stroke="none" />
  </IconShell>
);

export const SlidersHorizontalIcon = (props: IconProps) => (
  <IconShell {...props}>
    <path d="M3.5 8h17M3.5 16h17" />
    <circle cx="9" cy="8" r="2.4" fill="#fff" />
    <circle cx="15.5" cy="16" r="2.4" fill="#fff" />
  </IconShell>
);

export const InfoIcon = (props: IconProps) => (
  <IconShell {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5" />
    <circle cx="12" cy="7.6" r="1.1" fill="currentColor" stroke="none" />
  </IconShell>
);

export const PencilSimpleIcon = (props: IconProps) => (
  <IconShell {...props}>
    <path d="m21.31 6.878-4.188-4.19a1.5 1.5 0 0 0-2.122 0L3.44 14.25A1.49 1.49 0 0 0 3 15.31v4.19A1.5 1.5 0 0 0 4.5 21h4.19a1.49 1.49 0 0 0 1.06-.44L21.31 9a1.5 1.5 0 0 0 0-2.122M4.81 15l7.94-7.94 1.565 1.565-7.94 7.939zm-.31 1.81 2.69 2.69H4.5zM9 19.19l-1.565-1.565 7.94-7.94 1.565 1.565zm9-9L13.81 6l2.25-2.25 4.19 4.189z" />
  </IconShell>
);

export const XIcon = (props: IconProps) => (
  <IconShell {...props}>
    <path d="M20.25 4.5H16.5v-.75a2.25 2.25 0 0 0-2.25-2.25h-4.5A2.25 2.25 0 0 0 7.5 3.75v.75H3.75a.75.75 0 0 0 0 1.5h.75v13.5A1.5 1.5 0 0 0 6 21h12a1.5 1.5 0 0 0 1.5-1.5V6h.75a.75.75 0 1 0 0-1.5M9 3.75A.75.75 0 0 1 9.75 3h4.5a.75.75 0 0 1 .75.75v.75H9zm9 15.75H6V6h12zm-7.5-9.75v6a.75.75 0 1 1-1.5 0v-6a.75.75 0 0 1 1.5 0m4.5 0v6a.75.75 0 1 1-1.5 0v-6a.75.75 0 1 1 1.5 0" />
  </IconShell>
);

export const ArrowUpIcon = (props: IconProps) => (
  <IconShell {...props}>
    <path d="M12 19V5" />
    <path d="M6 11l6-6 6 6" />
  </IconShell>
);

// The design system draws both carets in a single 24px box as one paired specimen,
// which leaves each one off-centre on its own. Shifted to the viewBox centre here.
export const CaretLeftIcon = (props: IconProps) => (
  <IconShell {...props}>
    <path d="M14.5 5l-5 7 5 7" />
  </IconShell>
);

export const CaretRightIcon = (props: IconProps) => (
  <IconShell {...props}>
    <path d="M9.5 5l5 7-5 7" />
  </IconShell>
);

export const WarningCircleIcon = (props: IconProps) => (
  <IconShell {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v6" />
    <circle cx="12" cy="16.8" r="1.1" fill="currentColor" stroke="none" />
  </IconShell>
);

import type { ComponentPropsWithoutRef } from "react";

/** Size comes from a width class on the call site, e.g. `<EyeIcon className="w-5" />`. */
export type IconProps = ComponentPropsWithoutRef<"svg">;

/** Rail icons flip to solid when their toggle is on. */
type SolidIconProps = IconProps & { solid?: boolean };

export const EyeIcon = ({ solid = true, ...props }: SolidIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <ellipse cx="12" cy="12" rx="9.5" ry="6" />
    <circle cx="12" cy="12" r="2.6" fill={solid ? "currentColor" : "none"} />
  </svg>
);

export const EyeSlashIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <ellipse cx="12" cy="12" rx="9.5" ry="6" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M4 20 20 4" />
  </svg>
);

export const LockSimpleIcon = ({ solid = false, ...props }: SolidIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
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
  </svg>
);

export const LockOpenIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5" />
    <path d="M8.2 10.5V8.2a3.8 3.8 0 0 1 7.6 0" />
  </svg>
);

export const CircleHalfIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a9 9 0 0 0 0 18Z" fill="currentColor" stroke="none" />
  </svg>
);

export const SlidersHorizontalIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    {...props}
  >
    <path d="M3.5 8h17M3.5 16h17" />
    <circle cx="9" cy="8" r="2.4" fill="#fff" />
    <circle cx="15.5" cy="16" r="2.4" fill="#fff" />
  </svg>
);

export const InfoIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    {...props}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5" />
    <circle cx="12" cy="7.6" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const XIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.6}
    strokeLinecap="round"
    {...props}
  >
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

// The design system draws both carets in a single 24px box as one paired specimen,
// which leaves each one off-center on its own. Shifted to the viewBox center here.
export const CaretLeftIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14.5 5l-5 7 5 7" />
  </svg>
);

export const CaretRightIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9.5 5l5 7-5 7" />
  </svg>
);

export const WarningCircleIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    {...props}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v6" />
    <circle cx="12" cy="16.8" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const PlusIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M21 12a.75.75 0 0 1-.75.75h-7.5v7.5a.75.75 0 1 1-1.5 0v-7.5h-7.5a.75.75 0 1 1 0-1.5h7.5v-7.5a.75.75 0 1 1 1.5 0v7.5h7.5A.75.75 0 0 1 21 12" />
  </svg>
);

export const PencilSimpleIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="m21.31 6.878-4.188-4.19a1.5 1.5 0 0 0-2.122 0L3.44 14.25A1.49 1.49 0 0 0 3 15.31v4.19A1.5 1.5 0 0 0 4.5 21h4.19a1.49 1.49 0 0 0 1.06-.44L21.31 9a1.5 1.5 0 0 0 0-2.122M4.81 15l7.94-7.94 1.565 1.565-7.94 7.939zm-.31 1.81 2.69 2.69H4.5zM9 19.19l-1.565-1.565 7.94-7.94 1.565 1.565zm9-9L13.81 6l2.25-2.25 4.19 4.189z" />
  </svg>
);

export const TrashIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M20.25 4.5H16.5v-.75a2.25 2.25 0 0 0-2.25-2.25h-4.5A2.25 2.25 0 0 0 7.5 3.75v.75H3.75a.75.75 0 0 0 0 1.5h.75v13.5A1.5 1.5 0 0 0 6 21h12a1.5 1.5 0 0 0 1.5-1.5V6h.75a.75.75 0 1 0 0-1.5M9 3.75A.75.75 0 0 1 9.75 3h4.5a.75.75 0 0 1 .75.75v.75H9zm9 15.75H6V6h12zm-7.5-9.75v6a.75.75 0 1 1-1.5 0v-6a.75.75 0 0 1 1.5 0m4.5 0v6a.75.75 0 1 1-1.5 0v-6a.75.75 0 1 1 1.5 0" />
  </svg>
);

export const DownloadIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M21 13.5v6a.75.75 0 0 1-.75.75H3.75A.75.75 0 0 1 3 19.5v-6a.75.75 0 1 1 1.5 0v5.25h15V13.5a.75.75 0 1 1 1.5 0M8.78 7.28l2.47-2.47v8.69a.75.75 0 1 0 1.5 0V4.81l2.47 2.47a.75.75 0 1 0 1.06-1.06l-3.75-3.75a.75.75 0 0 0-1.06 0L7.72 6.22a.75.75 0 0 0 1.06 1.06" />
  </svg>
);

export const LogoIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 72 72"
    {...props}
  >
    <path
      fill="#d80000"
      d="M7.754 46.805h3.254v3.254H7.754zM14.263 46.805h3.254v3.254h-3.254zM20.771 46.805h3.254v3.254h-3.254zM27.279 40.297h3.254v3.254h-3.254zM27.279 46.805h6.508v3.254h-6.508zM24.026 43.551h6.508v3.254h-6.508zM7.754 40.297h16.271v3.254H7.754zM39.212 9.924h13.017v4.339H39.212zM52.23 13.178h6.508v4.339H52.23z"
    />
    <path
      fill="#d80000"
      d="M58.737 16.432h3.254v4.339h-3.254zM61.992 20.771h3.254v16.271h-3.254zM61.992 40.297h3.254v3.254h-3.254zM58.737 43.551h3.254v3.254h-3.254zM58.737 53.313h3.254v3.254h-3.254zM55.483 56.568h3.254v3.254h-3.254zM39.212 56.568h3.254v3.254h-3.254zM35.958 53.313h3.254v3.254h-3.254zM39.212 50.059h3.254v3.254h-3.254zM42.467 40.297h3.254v3.254h-3.254zM35.958 46.805h6.508v3.254h-6.508zM6.67 24.025h3.254v3.254H6.67zM4.5 27.28h3.254v19.525H4.5zM42.467 43.551h13.017v13.017H42.467zM42.467 59.822h13.017v3.254H42.467zM58.737 24.025h3.254v16.271h-3.254z"
    />
    <path fill="#fff" d="M58.737 24.025h3.254v-3.254h-3.254z" />
    <path
      fill="#d80000"
      d="M55.483 24.025h3.254v-3.254h-3.254zM52.23 27.28h3.254v-3.254H52.23zM48.975 30.534h3.254V27.28h-3.254zM48.975 40.297h3.254v-3.254h-3.254z"
    />
    <path
      fill="#fff"
      d="M42.467 40.297h6.508v-3.254h-6.508zM39.212 17.517h13.017v-3.254H39.212zM9.924 27.28H22.94v-3.254H9.924zM7.754 30.534h13.017V27.28H7.754z"
    />
    <path
      fill="#fff"
      d="M7.754 33.788h13.017v-3.254H7.754zM35.958 20.771h3.254v-3.254h-3.254zM42.467 20.771h3.254v-3.254h-3.254zM52.23 24.025h3.254v-3.254H52.23z"
    />
    <path
      fill="#fff"
      d="M48.975 20.771h9.763v-3.254h-9.763zM45.72 43.55h6.509v-3.253H45.72z"
    />
    <path
      fill="#d80000"
      d="M52.23 43.55h3.254v-3.253H52.23zM45.72 37.042h3.255v-6.508H45.72z"
    />
    <path fill="#fff" d="M42.467 37.042h3.254v-6.508h-3.254z" />
    <path
      fill="#d80000"
      d="M55.483 37.042h3.254V27.28h-3.254zM61.992 53.314h3.254v-6.509h-3.254zM55.483 53.314h3.254v-6.509h-3.254zM65.246 27.28H68.5v19.525h-3.254zM32.704 14.263h6.508v3.254h-6.508zM29.449 17.517h6.508v3.254h-6.508zM39.212 17.517h3.254v3.254h-3.254zM45.721 17.517h3.254v3.254h-3.254zM26.195 20.771h26.034v3.254H26.195z"
    />
    <path
      fill="#d80000"
      d="M22.941 24.025h29.288v3.254H22.941zM22.941 27.28h22.78v3.254h-22.78z"
    />
    <path
      fill="#d80000"
      d="M22.941 30.534h19.525v3.254H22.941zM19.686 33.788h22.78v3.254h-22.78zM7.754 37.042h34.712v3.254H7.754zM32.704 40.297h9.763v6.508h-9.763z"
    />
    <path
      fill="#000"
      d="M7.754 33.788h11.932v3.254H7.754zM7.754 43.551h16.271v3.254H7.754zM20.771 27.28h2.169v6.508h-2.169zM30.534 40.297h2.169v6.508h-2.169zM24.026 40.297h3.254v3.254h-3.254zM11.009 46.805h3.254v3.254h-3.254zM17.517 46.805h3.254v3.254h-3.254zM24.026 46.805h3.254v3.254h-3.254zM35.958 50.059h3.254v3.254h-3.254zM39.212 53.313h3.254v3.254h-3.254zM55.483 43.551h3.254v3.254h-3.254zM52.23 37.042h6.508v3.254H52.23zM48.975 30.534h6.508v6.508h-6.508zM55.483 40.297h6.508v3.254h-6.508zM61.992 43.551h3.254v3.254h-3.254zM61.992 37.042h3.254v3.254h-3.254z"
    />
    <path
      fill="#000"
      d="M52.23 27.28h3.254v3.254H52.23zM45.721 27.28h3.254v3.254h-3.254zM55.483 24.025h3.254v3.254h-3.254zM55.483 53.313h3.254v3.254h-3.254zM58.737 46.805h3.254v6.508h-3.254zM42.467 56.568h13.017v3.254H42.467zM33.788 46.805h2.169v3.254h-2.169z"
    />
  </svg>
);

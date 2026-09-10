import type { ComponentPropsWithoutRef } from "react";

/** Size comes from a width class on the call site, e.g. `<EyeIcon className="w-5" />`. */
export type IconProps = ComponentPropsWithoutRef<"svg">;

export const EyeIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M12 4c3.952 0 7.79 2.272 10.357 6.583.52.873.52 1.961 0 2.834C19.79 17.727 15.952 20 12 20s-7.79-2.272-10.357-6.583a2.77 2.77 0 0 1 0-2.834C4.21 6.273 8.048 4 12 4m-3.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"
      clipRule="evenodd"
    />
  </svg>
);

export const EyeSlashIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M2.293 2.293a1 1 0 0 1 1.414 0l3.64 3.64.004.003L18.064 16.65l.003.002 3.64 3.64a1 1 0 0 1-1.414 1.415l-3.09-3.09c-2.519 1.405-5.333 1.746-8.01.994-2.922-.821-5.601-2.921-7.549-6.193a2.77 2.77 0 0 1-.001-2.834c.988-1.66 2.163-3.018 3.465-4.061L2.293 3.707a1 1 0 0 1 0-1.414M8 12c0-.741.203-1.436.554-2.032l1.514 1.514a2 2 0 0 0 2.45 2.45l1.514 1.514A4 4 0 0 1 8 12"
      clipRule="evenodd"
    />
    <path
      fill="#7a7a7a"
      d="M22.356 13.417a16 16 0 0 1-2.002 2.695L8.762 4.52A10.4 10.4 0 0 1 11.999 4c3.952 0 7.791 2.272 10.357 6.583.52.873.52 1.961 0 2.834"
    />
  </svg>
);

export const LockIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M12 2a5 5 0 0 0-5 5v2a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3V7a5 5 0 0 0-5-5m3 7V7a3 3 0 1 0-6 0v2zm-3 4a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1"
      clipRule="evenodd"
    />
  </svg>
);

export const UnlockIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M12 2a5 5 0 0 0-5 5v2a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3H9V7a3 3 0 0 1 5.906-.75 1 1 0 0 0 1.936-.5A5 5 0 0 0 12 2m0 11a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1"
      clipRule="evenodd"
    />
  </svg>
);

export const CircleHalfIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M12 20a8 8 0 1 0 0-16zm10-8c0 5.523-4.477 10-10 10q-.562 0-1.11-.061C5.89 21.386 2 17.148 2 12s3.89-9.386 8.89-9.939A10 10 0 0 1 12 2c5.523 0 10 4.477 10 10"
      clipRule="evenodd"
    />
  </svg>
);

export const SettingsIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    {...props}
  >
    <path strokeWidth="2" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path
      strokeLinejoin="round"
      strokeWidth="2"
      d="M7.5 4.205c-.121.07-.182.105-.233.14a2 2 0 0 0-.78 2.336c.02.058.047.122.102.251l.178.419a7 7 0 0 0-1.412 2.441l-.45.055a5 5 0 0 0-.268.037 2 2 0 0 0-1.633 1.845c-.004.06-.004.13-.004.27s0 .21.004.271a2 2 0 0 0 1.633 1.846c.06.01.13.019.269.036l.449.055c.303.911.788 1.74 1.412 2.442l-.178.418a5 5 0 0 0-.103.251 2 2 0 0 0 .781 2.337c.051.034.112.07.233.14s.182.104.237.131a2 2 0 0 0 2.414-.492c.04-.046.082-.102.166-.214l.272-.362a7 7 0 0 0 2.822 0l.272.361c.084.112.126.168.166.215a2 2 0 0 0 2.415.492c.054-.027.115-.062.236-.132s.182-.105.233-.139a2 2 0 0 0 .78-2.337c-.02-.058-.047-.122-.102-.25l-.178-.419a7 7 0 0 0 1.412-2.442l.45-.055a5 5 0 0 0 .268-.036 2 2 0 0 0 1.633-1.845C21 12.21 21 12.14 21 12s0-.21-.004-.271a2 2 0 0 0-1.633-1.845 5 5 0 0 0-.269-.037l-.45-.055a7 7 0 0 0-1.411-2.441l.178-.419c.055-.128.082-.193.103-.25a2 2 0 0 0-.781-2.338 5 5 0 0 0-.233-.138c-.121-.07-.182-.105-.236-.133a2 2 0 0 0-2.415.493c-.04.046-.082.102-.166.214l-.272.362a7 7 0 0 0-2.821 0l-.273-.362c-.084-.112-.126-.168-.166-.214a2 2 0 0 0-2.414-.493 5 5 0 0 0-.237.132Z"
    />
  </svg>
);

export const InfoIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M11 11h1v5m9-4a9 9 0 1 1-18 0 9 9 0 0 1 18 0"
    />
    <path
      fill="currentColor"
      stroke="currentColor"
      strokeWidth=".5"
      d="M12 7.25a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z"
    />
  </svg>
);

export const WarningIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path
      fill="currentColor"
      d="m11.157 12.256-.47-3.768a1.324 1.324 0 1 1 2.627 0l-.47 3.768a.85.85 0 0 1-1.687 0"
    />
    <circle cx="12" cy="15.8" r="1.2" fill="currentColor" />
  </svg>
);

export const XIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M4.19 4.19a1.5 1.5 0 0 1 2.12 0L12 9.878l5.69-5.69a1.5 1.5 0 0 1 2.12 2.122L14.122 12l5.69 5.69a1.5 1.5 0 0 1-2.122 2.12L12 14.122l-5.69 5.69a1.5 1.5 0 0 1-2.12-2.122L9.878 12l-5.69-5.69a1.5 1.5 0 0 1 0-2.12"
      clipRule="evenodd"
    />
  </svg>
);

export const PlusIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M12 3a1 1 0 0 1 1 1v7h7a1 1 0 1 1 0 2h-7v7a1 1 0 1 1-2 0v-7H4a1 1 0 1 1 0-2h7V4a1 1 0 0 1 1-1"
      clipRule="evenodd"
    />
  </svg>
);

export const MinusIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M3 12a1 1 0 0 1 1-1h16a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1"
      clipRule="evenodd"
    />
  </svg>
);

export const EditIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="m14 16 8-8-6-6-8.2 8.2 3 3C11.972 14.372 14 16 14 16"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
      d="m7.8 10.2 3 3C11.972 14.372 14 16 14 16m-4 4L22 8l-6-6L4 14"
    />
    <path
      fill="currentColor"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="m4 14-1 7 7-1z"
    />
  </svg>
);

export const DeleteIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M7.23 5H3.5a1 1 0 0 0 0 2h.532l.842 12.206A3 3 0 0 0 7.867 22h8.266a3 3 0 0 0 2.993-2.794L19.968 7h.532a1 1 0 1 0 0-2h-3.73a5.001 5.001 0 0 0-9.54 0M9.4 5h5.198A3 3 0 0 0 9.4 5M10 10a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1m4 0a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1"
      clipRule="evenodd"
    />
  </svg>
);

export const UploadIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M4 13.75a1 1 0 0 1 1 1V18a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.25a1 1 0 1 1 2 0V18a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-3.25a1 1 0 0 1 1-1"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M12 3a1 1 0 0 1 .707.293l4.5 4.5a1 1 0 0 1-1.414 1.414L13 6.414v8.836a1 1 0 1 1-2 0V6.414L8.207 9.207a1 1 0 0 1-1.414-1.414l4.5-4.5A1 1 0 0 1 12 3"
      clipRule="evenodd"
    />
  </svg>
);

export const UploadImageIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeWidth="2"
      d="M14.5 11.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M11 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="m11 15-1.586-1.586a2 2 0 0 0-2.828 0L4 16"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
      d="M15 18h6M18 15v6"
    />
  </svg>
);

export const ClipboardIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
      d="M8 8v-.8c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C9.52 4 10.08 4 11.2 4h5.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C20 5.52 20 6.08 20 7.2v5.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C18.48 16 17.92 16 16.8 16H16m0-4.8v5.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C14.48 20 13.92 20 12.8 20H7.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C4 18.48 4 17.92 4 16.8v-5.6c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C5.52 8 6.08 8 7.2 8h5.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C16 9.52 16 10.08 16 11.2Z"
    />
  </svg>
);

export const CaretLeftIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M15.707 3.293a1 1 0 0 1 0 1.414l-6.585 6.586a1 1 0 0 0 0 1.414l6.585 6.586a1 1 0 0 1-1.414 1.414l-6.586-6.586a3 3 0 0 1 0-4.242l6.586-6.586a1 1 0 0 1 1.414 0"
      clipRule="evenodd"
    />
  </svg>
);

export const CaretRightIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M8.293 3.293a1 1 0 0 1 1.414 0l6.586 6.586a3 3 0 0 1 0 4.242l-6.586 6.586a1 1 0 0 1-1.414-1.414l6.586-6.586a1 1 0 0 0 0-1.414L8.293 4.707a1 1 0 0 1 0-1.414"
      clipRule="evenodd"
    />
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

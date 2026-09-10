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

export const ScaleIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      d="M15.293 15.293a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1 .234.374l.015.04.016.062A1 1 0 0 1 20 19q-.001.084-.016.165a1 1 0 0 1-.028.127q-.007.02-.015.04a1 1 0 0 1-.234.375l-3 3a1 1 0 0 1-1.414-1.414L16.586 20H9a1 1 0 1 1 0-2h7.586l-1.293-1.293a1 1 0 0 1 0-1.414M5.02 4.001q.027 0 .053.002l.053.005q.018.002.035.006a1 1 0 0 1 .546.279l3 3a1 1 0 0 1-1.414 1.414L6 7.414V15a1 1 0 0 1-2 0V7.414L2.707 8.707a1 1 0 1 1-1.414-1.414l3-3a1 1 0 0 1 .45-.259l.049-.013.033-.005A1 1 0 0 1 4.98 4L5 4zM19 10a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1M17 4a3 3 0 0 1 3 3 1 1 0 0 1-1.995.103l-.01-.206a1 1 0 0 0-.893-.892l-.205-.01A1 1 0 0 1 17 4M13 4a1 1 0 0 1 0 2h-2a1 1 0 1 1 0-2z"
    />
  </svg>
);

export const LogoMark = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="#fc0"
      d="M1.2 3.92c0-1.241 1.409-1.957 2.411-1.226l7.691 5.614a1.52 1.52 0 0 0 1.789 0l7.69-5.614c1.003-.731 2.412-.015 2.412 1.225v16.164c0 .838-.68 1.517-1.517 1.517H2.716c-.837 0-1.516-.68-1.516-1.517z"
    />
    <path
      fill="#fff"
      d="M5.371 13.334c0-.67.543-1.214 1.214-1.214h3.64c.67 0 1.213.544 1.213 1.214v3.64c0 .67-.543 1.213-1.213 1.213h-3.64c-.67 0-1.214-.543-1.214-1.213z"
    />
    <path
      fill="#131313"
      d="M11.135 15.154a1.213 1.213 0 1 1-2.427 0 1.213 1.213 0 0 1 2.427 0"
    />
    <path
      fill="#fff"
      d="M12.955 13.334c0-.67.543-1.214 1.213-1.214h3.64c.67 0 1.214.544 1.214 1.214v3.64c0 .67-.543 1.213-1.214 1.213h-3.64c-.67 0-1.213-.543-1.213-1.213z"
    />
    <path
      fill="#131313"
      d="M18.719 15.154a1.213 1.213 0 1 1-2.427 0 1.213 1.213 0 0 1 2.426 0"
    />
  </svg>
);

export const LogoLockup = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 100 20"
    {...props}
  >
    <path
      fill="#fc0"
      d="M0 1.266C0 .232 1.174-.364 2.01.246l6.408 4.677a1.26 1.26 0 0 0 1.49 0l6.41-4.678a1.264 1.264 0 0 1 2.01 1.021v13.47c0 .698-.567 1.264-1.265 1.264h-15.8A1.264 1.264 0 0 1 0 14.736z"
    />
    <path
      fill="#fff"
      d="M3.476 9.112c0-.559.453-1.012 1.011-1.012H7.52c.559 0 1.012.453 1.012 1.012v3.033c0 .558-.453 1.011-1.012 1.011H4.487a1.01 1.01 0 0 1-1.011-1.011z"
    />
    <path
      fill="#131313"
      d="M8.279 10.628a1.011 1.011 0 1 1-2.022 0 1.011 1.011 0 0 1 2.022 0"
    />
    <path
      fill="#fff"
      d="M9.796 9.112c0-.559.452-1.012 1.01-1.012h3.034c.559 0 1.011.453 1.011 1.012v3.033c0 .558-.452 1.011-1.01 1.011h-3.034a1.01 1.01 0 0 1-1.011-1.011z"
    />
    <path
      fill="#131313"
      d="M14.599 10.628a1.011 1.011 0 1 1-2.023 0 1.011 1.011 0 0 1 2.023 0"
    />
    <path
      fill="#000"
      d="M23.807 15V1h3.56l3.52 11.1 3.5-11.1h3.56v14h-2.38V3.62L31.847 15h-1.94l-3.74-11.44V15zM42.757 15.2c-2.3 0-3.72-1.18-3.72-3.1 0-1.78 1.1-2.84 3.26-3.1l2.64-.34c.96-.12 1.36-.54 1.36-1.2 0-.84-.72-1.5-2.22-1.46-1.42.02-2.4.7-2.58 1.78h-2.26c.28-2.16 2.26-3.66 4.98-3.66 2.76 0 4.36 1.42 4.36 3.52v4.76c0 .7.28.92.88.92h.26V15h-.98c-1.36 0-2.06-.58-2.2-1.72h-.06c-.58 1.22-1.92 1.92-3.72 1.92m.66-1.76c1.78 0 2.88-1.12 2.88-2.84V9.44c-.24.58-.78.86-1.56.96l-1.96.26c-.92.12-1.46.6-1.46 1.34 0 .9.78 1.44 2.1 1.44M54.324 15c-2.12 0-3.26-1.1-3.26-3.12V6.32h-2.02V4.4h2.02V1h2.34v3.4h2.66v1.92h-2.66v5.5c0 .88.44 1.34 1.26 1.34h1.4V15zM61.559 15.26c-3.2 0-5.38-2.3-5.38-5.64 0-3.26 2.18-5.5 5.38-5.5 2.7 0 4.64 1.66 4.94 4.22h-2.3c-.26-1.44-1.22-2.28-2.64-2.28-1.82 0-3.02 1.42-3.02 3.56 0 2.22 1.2 3.7 3.02 3.7 1.42 0 2.4-.84 2.64-2.28h2.3c-.38 2.6-2.26 4.22-4.94 4.22M67.399 15V.2h2.32v5.7c.76-1.12 2-1.78 3.44-1.78 2.24 0 3.7 1.48 3.7 3.78V15h-2.34V8.34c0-1.42-.74-2.24-2.14-2.24-1.56 0-2.66 1.16-2.66 2.98V15zM81.757 15.26c-2.36 0-3.78-1.46-3.78-3.78V4.4h2.34v6.64c0 1.46.74 2.24 2.18 2.24 1.58 0 2.62-1.16 2.62-2.94V4.4h2.34V15h-2.08l-.18-1.64c-.66 1.24-1.82 1.9-3.44 1.9M88.776 19.2V4.4h2.08l.18 1.7c.72-1.22 2.06-1.98 3.68-1.98 2.76 0 4.68 2.26 4.68 5.56s-1.92 5.58-4.68 5.58c-1.56 0-2.84-.68-3.58-1.82v5.76zm5.38-5.88c1.7 0 2.88-1.5 2.88-3.66 0-2.14-1.18-3.6-2.88-3.6-1.74 0-2.98 1.44-2.98 3.54 0 2.2 1.24 3.72 2.98 3.72"
    />
  </svg>
);

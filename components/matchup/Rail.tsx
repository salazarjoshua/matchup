import { cn } from "@/utils/cn";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type RailProps = ComponentPropsWithoutRef<"div"> & { children: ReactNode };

const RailGrip = ({ className, ...props }: ComponentPropsWithoutRef<"div">) => (
  <div
    className={cn(
      "w-full cursor-grab grid place-content-center gap-1 text-white/38 pt-2 -my-3",
      className,
    )}
    {...props}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="currentColor"
      viewBox="0 0 256 256"
      className="sr-only"
    >
      <path d="M72,92A12,12,0,1,1,60,80,12,12,0,0,1,72,92Zm56-12a12,12,0,1,0,12,12A12,12,0,0,0,128,80Zm68,24a12,12,0,1,0-12-12A12,12,0,0,0,196,104ZM60,152a12,12,0,1,0,12,12A12,12,0,0,0,60,152Zm68,0a12,12,0,1,0,12,12A12,12,0,0,0,128,152Zm68,0a12,12,0,1,0,12,12A12,12,0,0,0,196,152Z"></path>
    </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      className="w-6"
    >
      <path d="M6.75 8.625a1.125 1.125 0 1 1-2.25 0 1.125 1.125 0 0 1 2.25 0M12 7.5a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25m6.375 2.25a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25m-12.75 4.5a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25m6.375 0a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25m6.375 0a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25" />
    </svg>
  </div>
);

const RailDivider = () => <div className="h-px w-6 bg-white/16" />;

const Rail = ({ className, children, ...props }: RailProps) => (
  <div
    className={cn(
      "w-rail rounded-panel border-hairline-dark bg-rail flex flex-none flex-col items-center gap-2 border py-3",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export { Rail, RailGrip, RailDivider };
export type { RailProps };

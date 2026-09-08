import { DownloadIcon } from "@/components/icons";
import { cn } from "@/utils/cn";
import type { ComponentPropsWithoutRef } from "react";

type EmptyStateProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  onUpload?: () => void;
  onPaste?: () => void;
};

const EmptyState = ({
  onUpload,
  onPaste,
  className,
  ...props
}: EmptyStateProps) => (
  <div className={cn("flex gap-3 p-3", className)} {...props}>
    <button
      type="button"
      onClick={onUpload}
      className="rounded-control bg-accent-red flex aspect-square flex-1 flex-col justify-between p-3 text-left text-white"
    >
      <DownloadIcon className="w-6.5 text-white" />
      <span className="text-tile-label">Upload</span>
    </button>
    <button
      type="button"
      onClick={onPaste}
      className="rounded-control bg-accent-yellow text-ink flex aspect-square flex-1 flex-col justify-between p-3 text-left"
    >
      <span className="font-sans text-[24px] leading-none">⌘V</span>
      <span className="text-tile-label">Paste</span>
    </button>
  </div>
);

export { EmptyState };
export type { EmptyStateProps };

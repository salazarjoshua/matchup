import { UploadIcon, ClipboardIcon } from "@/components/icons";
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
  <div className={cn("flex gap-2 p-3", className)} {...props}>
    <button
      type="button"
      onClick={onUpload}
      className="rounded-xl bg-accent-blue flex aspect-square flex-1 flex-col justify-between p-3 text-left text-white"
    >
      <UploadIcon className="w-7" />
      <span className="text-sm font-semibold">Upload</span>
    </button>
    <button
      type="button"
      onClick={onPaste}
      className="rounded-xl bg-accent-yellow text-ink flex aspect-square flex-1 flex-col justify-between p-3 text-left"
    >
      <ClipboardIcon className="w-7" />
      <span className="text-sm font-semibold">Paste</span>
    </button>
  </div>
);

export { EmptyState };
export type { EmptyStateProps };

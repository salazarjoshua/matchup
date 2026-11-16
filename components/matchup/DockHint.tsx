import { SidePanelIcon, XIcon } from "@/components/icons";
import { cn } from "@/utils/cn";
import type { ComponentPropsWithoutRef } from "react";

type DockHintProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  onDock?: () => void;
  onDismiss?: () => void;
};

/** The error banner's shape in blue: a suggestion, not something gone wrong. */
const DockHint = ({
  onDock,
  onDismiss,
  className,
  ...props
}: DockHintProps) => (
  <div className={cn("px-3 pt-3", className)} {...props}>
    <div
      role="status"
      className="rounded-xl bg-accent-blue flex items-start gap-1.5 px-3 py-2.5 font-sans text-[11px]/4 text-white"
    >
      <span className="grid h-4 flex-none place-items-center">
        <SidePanelIcon className="w-4" />
      </span>
      <span className="flex-1">
        Dock this to the side panel to keep the page clear.
      </span>
      <button
        type="button"
        onClick={onDock}
        className="h-4 flex-none rounded-sm font-semibold underline"
      >
        Dock
      </button>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="box-content grid h-4 flex-none place-items-center rounded-sm px-3 py-2.5 -my-2.5 -mr-3"
      >
        <XIcon className="w-3" />
      </button>
    </div>
  </div>
);

export { DockHint };

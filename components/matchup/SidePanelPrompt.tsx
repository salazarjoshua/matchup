import { LogoMark } from "@/components/icons";
import { cn } from "@/utils/cn";
import type { ComponentPropsWithoutRef } from "react";

type SidePanelPromptProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
> & {
  /** Named so it is obvious which page the layers would belong to. */
  host?: string;
  restricted?: boolean;
  needsReload?: boolean;
  onOpenPage?: () => void;
  onReload?: () => void;
  onClose?: () => void;
};

const SidePanelPrompt = ({
  host,
  restricted = false,
  needsReload = false,
  onOpenPage,
  onReload,
  onClose,
  className,
  ...props
}: SidePanelPromptProps) => {
  const copy = restricted
    ? {
        title: "Matchup can’t run here",
        body: "Browser pages and extension stores are off limits. Switch to a site to get started.",
        action: undefined,
      }
    : needsReload
      ? {
          title: "This page needs a reload",
          body: "Matchup loads with the page, and this one opened before the extension did.",
          action: { label: "Reload page", run: onReload },
        }
      : {
          title: "Matchup isn’t on this page",
          body: host
            ? `Turn it on to lay a design over ${host}. Layers are kept per site.`
            : "Turn it on to lay a design over this page.",
          action: { label: "Open on this page", run: onOpenPage },
        };

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center gap-4 p-6 text-center",
        className,
      )}
      {...props}
    >
      <LogoMark className="w-10" />

      <div className="flex flex-col gap-1">
        <h1 className="text-ink text-sm font-semibold">{copy.title}</h1>
        <p className="text-muted text-xs text-pretty">{copy.body}</p>
      </div>

      <div className="flex w-full max-w-56 flex-col items-center gap-1">
        {copy.action && (
          <button
            type="button"
            onClick={copy.action.run}
            className="bg-accent-blue h-8 w-full rounded-xl text-xs font-semibold text-white"
          >
            {copy.action.label}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="text-muted hover:text-ink h-8 rounded-md px-2 text-xs"
        >
          Close side panel
        </button>
      </div>
    </div>
  );
};

export { SidePanelPrompt };
export type { SidePanelPromptProps };

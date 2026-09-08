import {
  LockSimpleIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@/components/icons";
import { cn } from "@/utils/cn";
import { useEffect, useRef } from "react";
import type { ComponentPropsWithoutRef } from "react";

// Stand-in for absent thumbnail imagery, matching the design's placeholder weave.
const PLACEHOLDER_WEAVE =
  "repeating-linear-gradient(135deg,#dcdcdc 0 4px,#eaeaea 4px 8px)";
const PLACEHOLDER_WEAVE_SELECTED =
  "repeating-linear-gradient(135deg,#c9c9c9 0 4px,#dedede 4px 8px)";

type LayerTileProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "onSelect"
> & {
  name: string;
  src?: string;
  selected?: boolean;
  locked?: boolean;
  hidden?: boolean;
  lifted?: boolean;
  renaming?: boolean;
  uploadProgress?: number;
  onSelect?: () => void;
  onStartRename?: () => void;
  onRename?: (name: string) => void;
  onDelete?: () => void;
};

const ThumbAction = ({
  label,
  onClick,
  children,
}: ComponentPropsWithoutRef<"button"> & { label: string }) => (
  <button
    type="button"
    aria-label={label}
    onClick={(event) => {
      event.stopPropagation();
      onClick?.(event);
    }}
    className="text-ink grid size-8 place-items-center rounded-full bg-white"
  >
    {children}
  </button>
);

const LayerTile = ({
  name,
  src,
  selected = false,
  locked = false,
  hidden = false,
  lifted = false,
  renaming = false,
  uploadProgress,
  onSelect,
  onStartRename,
  onRename,
  onDelete,
  className,
  ...props
}: LayerTileProps) => {
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) {
      input.current?.focus();
      input.current?.select();
    }
  }, [renaming]);

  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)} {...props}>
      <div
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        aria-label={`Select ${name}`}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect?.();
          }
        }}
        className={cn(
          "h-thumb rounded-control duration-120 group relative cursor-pointer overflow-hidden transition-all ease-out",
          "focus-visible:ring-[1.5px] focus-visible:ring-accent-blue focus-visible:outline-none",
          selected && "ring-accent-blue ring-2",
          !selected && "hover:ring-placeholder hover:ring-2",
          lifted &&
            "shadow-drag ring-accent-blue z-10 -rotate-2 scale-[1.03] ring-2",
          hidden && selected && "opacity-45",
        )}
        style={
          src
            ? undefined
            : {
                backgroundImage: selected
                  ? PLACEHOLDER_WEAVE_SELECTED
                  : PLACEHOLDER_WEAVE,
              }
        }
      >
        {src && (
          <img
            src={src}
            alt=""
            className="size-full object-cover select-none"
          />
        )}
        {uploadProgress === undefined && (
          <span className="rounded-control absolute inset-0 hidden items-center justify-center gap-2 bg-black/42 group-hover:flex">
            <ThumbAction label={`Rename ${name}`} onClick={onStartRename}>
              <PencilSimpleIcon className="w-3.25" />
            </ThumbAction>
            <ThumbAction label={`Delete ${name}`} onClick={onDelete}>
              <TrashIcon className="w-3.25" />
            </ThumbAction>
          </span>
        )}
        {locked && (
          <span className="rounded-badge bg-accent-orange text-ink absolute bottom-1 right-1 grid size-4.5 place-items-center">
            <LockSimpleIcon className="w-2.75" strokeWidth={2.6} solid />
          </span>
        )}
        {uploadProgress !== undefined && (
          <span className="text-micro text-ink absolute inset-0 grid place-items-center bg-white/72 font-mono">
            {`${uploadProgress}%`}
          </span>
        )}
      </div>
      {renaming ? (
        <input
          ref={input}
          defaultValue={name.replace(/\.[^.]+$/, "")}
          onBlur={(event) =>
            onRename?.(event.currentTarget.value.trim() || name)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") onRename?.(name);
          }}
          className="border-[1.5px] rounded-badge border-accent-blue text-micro text-ink h-4.5 w-full bg-white px-1.25 font-mono outline-none"
        />
      ) : (
        <div
          className={cn(
            "text-micro truncate font-mono",
            selected ? "text-ink" : "text-muted",
          )}
          title={name}
        >
          {name}
        </div>
      )}
    </div>
  );
};

export { LayerTile };
export type { LayerTileProps };

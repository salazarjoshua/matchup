import { EditIcon, DeleteIcon } from "@/components/icons";

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
  lifted?: boolean;
  renaming?: boolean;
  onSelect?: () => void;
  onStartRename?: () => void;
  onRename?: (name: string) => void;
  onDelete?: () => void;
  onDragStartLayer?: () => void;
  onDropOnLayer?: () => void;
  onDragEndLayer?: () => void;

  /** True while another tile is being dragged over this one. */
  dropTarget?: boolean;
};

const ThumbAction = ({
  label,
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"button"> & { label: string }) => (
  <button
    type="button"
    aria-label={label}
    className={cn(
      "relative grid size-6 place-items-center rounded-full bg-surface text-ink pointer-events-auto",
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

const LayerTile = ({
  name,
  src,
  selected = false,
  locked = false,
  lifted = false,
  renaming = false,
  onSelect,
  onStartRename,
  onRename,
  onDelete,
  onDragStartLayer,
  onDropOnLayer,
  onDragEndLayer,
  dropTarget = false,
  className,
  ...props
}: LayerTileProps) => {
  const input = useRef<HTMLInputElement>(null);
  const self = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) {
      self.current?.scrollIntoView({ block: "nearest" });
    }
  }, [selected]);

  useEffect(() => {
    if (renaming) {
      input.current?.focus();
      input.current?.select();
    }
  }, [renaming]);

  return (
    <div
      ref={self}
      className={cn("flex min-w-0 flex-col gap-2", className)}
      {...props}
    >
      <div className="group relative w-full rounded-control">
        <button
          type="button"
          aria-pressed={selected}
          aria-label={`Select ${name}`}
          draggable={Boolean(onDragStartLayer) && !renaming}
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", name);
            onDragStartLayer?.();
          }}
          onDragOver={(event) => {
            if (!onDropOnLayer) return;

            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
          }}
          onDrop={(event) => {
            event.preventDefault();
            onDropOnLayer?.();
          }}
          onDragEnd={onDragEndLayer}
          onClick={onSelect}
          className={cn(
            "relative w-full aspect-4/3 cursor-pointer overflow-hidden rounded-control",
            "focus-visible:ring-2 focus-visible:ring-focus",
            selected && "ring-2 ring-accent-blue",
            !selected && "group-hover:ring-2 group-hover:ring-disabled/75",
            lifted &&
              "z-10 -rotate-2 scale-[1.03] shadow-drag ring-2 ring-accent-blue",
            dropTarget && "ring-2 ring-offset-1 ring-accent-blue",
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
              className="size-full select-none object-cover"
            />
          )}
        </button>

        <div className="pointer-events-none aspect-4/3 absolute inset-0 p-1 items-start justify-between hidden group-hover:flex">
          <div className="pointer-events-none absolute inset-0 rounded-control bg-black/15 backdrop-blur-[2px]" />
          <ThumbAction label={`Rename ${name}`} onClick={onStartRename}>
            <EditIcon className="w-3 text-accent-blue" />
          </ThumbAction>

          <ThumbAction label={`Delete ${name}`} onClick={onDelete}>
            <DeleteIcon className="w-3 text-accent-red" />
          </ThumbAction>
        </div>
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
          className="h-4.5 w-full rounded-badge border-[1.5px] border-focus bg-white px-1.25 text-micro text-ink focus-visible:ring-0"
        />
      ) : (
        <div
          className={cn(
            "truncate text-micro",
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

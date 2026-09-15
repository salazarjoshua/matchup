import { EditIcon, DeleteIcon } from "@/components/icons";

import { cn } from "@/utils/cn";
import { hasFiles } from "@/utils/drag";

import { useEffect, useRef } from "react";

import type { ComponentPropsWithoutRef, DragEvent } from "react";

const BLANK_DRAG_IMAGE = new Image();
BLANK_DRAG_IMAGE.src =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/** Which half of the tile the pointer sits in decides which side the layer lands on. */
const isBefore = (event: DragEvent<HTMLElement>) => {
  const rect = event.currentTarget.getBoundingClientRect();
  return event.clientX < rect.left + rect.width / 2;
};

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
  onDragOverLayer?: (before: boolean) => void;
  onDragEndLayer?: () => void;

  /** Edge the drop line sits on, or undefined while no layer is over this tile. */
  insertion?: "before" | "after";
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
  onDragOverLayer,
  onDragEndLayer,
  insertion,
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
      draggable={Boolean(onDragStartLayer) && !renaming}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", name);
        event.dataTransfer.setDragImage(BLANK_DRAG_IMAGE, 0, 0);
        onDragStartLayer?.();
      }}
      onDragOver={(event) => {
        // A file drag belongs to the panel's drop zone, not to reordering.
        if (!onDragOverLayer || hasFiles(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        onDragOverLayer(isBefore(event));
      }}
      onDragEnd={onDragEndLayer}
      className={cn(
        // select-none: a stray selection in the filename is dragged as text instead
        // of the layer, which kills the drag with no sign of why.
        "relative flex min-w-0 select-none flex-col gap-2.5 transition-[scale_rotate]",
        lifted && "z-10 -rotate-2 scale-[0.9]",
        className,
      )}
      {...props}
    >
      {insertion && (
        <span
          aria-hidden
          className={cn(
            "z-20 bg-accent-blue pointer-events-none absolute top-6 h-4 ring-2 ring-accent-blue/25 w-0.5 rounded-full",
            insertion === "before" ? "-left-1.5" : "-right-1.5",
          )}
        />
      )}
      <div className="group relative w-full rounded-xl">
        <button
          type="button"
          aria-pressed={selected}
          aria-label={`Select ${name}`}
          onClick={onSelect}
          className={cn(
            "relative block w-full aspect-4/3 cursor-pointer overflow-hidden rounded-xl",
            "ring-2 ring-surface focus-visible:ring-2 focus-visible:ring-focus",
            selected && "ring-2 ring-accent-blue",
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
              draggable={false}
              className="size-full select-none object-cover"
            />
          )}
        </button>

        <div
          className={cn(
            "pointer-events-none aspect-4/3 absolute inset-0 p-1 items-start justify-between hidden group-hover:flex",
            lifted && `opacity-0`,
          )}
        >
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-black/15 backdrop-blur-[2px]" />
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
          className="h-4.5 w-full rounded-md border-[1.5px] border-focus bg-white px-1.25 text-micro text-ink focus-visible:ring-0"
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


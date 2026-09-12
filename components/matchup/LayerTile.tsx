import { EditIcon, DeleteIcon } from "@/components/icons";

import { cn } from "@/utils/cn";

import { useEffect, useRef } from "react";

import type { ComponentPropsWithoutRef, DragEvent } from "react";

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
  onDropOnLayer?: (before: boolean) => void;
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
  onDropOnLayer,
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
        onDragStartLayer?.();
      }}
      onDragOver={(event) => {
        if (!onDropOnLayer) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        onDragOverLayer?.(isBefore(event));
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDropOnLayer?.(isBefore(event));
      }}
      onDragEnd={onDragEndLayer}
      className={cn("relative flex min-w-0 flex-col gap-2", className)}
      {...props}
    >
      {insertion && (
        <span
          aria-hidden
          className={cn(
            "bg-accent-blue pointer-events-none absolute top-6 h-4.5 w-0.5 rounded-full",
            insertion === "before" ? "-left-1.25" : "-right-1.25",
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
            "focus-visible:ring-2 focus-visible:ring-focus",
            selected && "ring-2 ring-accent-blue",
            !selected && "group-hover:ring-2 group-hover:ring-disabled/75",
            lifted &&
              "z-10 -rotate-2 transition-[scale] scale-[1.05] shadow-drag ring-2 ring-accent-blue",
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

export type { LayerTileProps };

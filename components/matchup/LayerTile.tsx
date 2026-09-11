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
  ...props
}: ComponentPropsWithoutRef<"button"> & { label: string }) => (
  <button
    type="button"
    aria-label={label}
    // The scrim above is pointer-events-none so clicks fall through to select;
    // the actions themselves have to opt back in.
    className="text-ink pointer-events-auto grid size-6 place-items-center rounded-full bg-surface"
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

  // Replaces the old jump-to-page: the grid scrolls now, so the tile that just
  // became selected brings itself into view. "nearest" is a no-op when it is
  // already visible, so clicking a tile never scrolls the list under you.
  useEffect(() => {
    if (selected) self.current?.scrollIntoView({ block: "nearest" });
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
      {/*
        The scrim and its actions are siblings of the select button, not children:
        a button may not contain another button, and while nested they were both
        invalid and unreachable by keyboard. `group` moves here so hover and focus
        are tracked across the pair.
      */}
      <div className="group relative">
        <button
          type="button"
          aria-pressed={selected}
          aria-label={`Select ${name}`}
          // Reordering stays inside the grid, which now holds every layer, so any
          // tile can be dropped on any other.
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
            "h-thumb rounded-control relative w-full cursor-pointer overflow-hidden",
            "duration-120 transition-all ease-out",
            selected && "ring-accent-blue ring-2",
            !selected && "hover:ring-accent-blue hover:ring-2",
            lifted &&
              "shadow-drag ring-accent-blue z-10 -rotate-2 scale-[1.03] ring-2",
            dropTarget && "ring-accent-blue ring-2 ring-offset-1",
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
        </button>
        {/*
        `hidden` rather than transparent, so the actions stay out of the tab order
        until the tile is reached — focusing the select button is what reveals
        them, and the next Tab then lands on Rename.
      */}
        <span className="rounded-control pointer-events-none absolute inset-0 hidden items-start justify-between gap-1 bg-black/40 p-1 backdrop-blur-xs group-hover:flex group-has-[:focus-visible]:flex">
          <ThumbAction label={`Rename ${name}`} onClick={onStartRename}>
            <EditIcon className="w-3 text-accent-blue" />
          </ThumbAction>
          <ThumbAction label={`Delete ${name}`} onClick={onDelete}>
            <DeleteIcon className="w-3 text-accent-red" />
          </ThumbAction>
        </span>
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
          className="border-[1.5px] rounded-badge border-accent-blue text-micro text-ink h-4.5 w-full bg-white px-1.25"
        />
      ) : (
        <div
          className={cn(
            "text-micro truncate",
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

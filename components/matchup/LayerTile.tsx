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
    className="text-ink grid size-6 place-items-center rounded-full bg-surface"
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
      <div
        role="button"
        tabIndex={0}
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
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect?.();
          }
        }}
        className={cn(
          "h-thumb rounded-control group relative cursor-pointer overflow-hidden",
          "duration-120 transition-all ease-out",
          "focus-visible:ring-[1.5px] focus-visible:ring-accent-blue focus-visible:outline-none",
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
        <span className="rounded-control absolute inset-0 items-start justify-between p-1 gap-1 bg-black/40 backdrop-blur-xs hidden group-hover:flex">
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
          className="border-[1.5px] rounded-badge border-accent-blue text-micro text-ink h-4.5 w-full bg-white px-1.25 outline-none"
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

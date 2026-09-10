import { AnchorPad } from "./AnchorPad";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";
import { Field } from "./Field";
import { AddButton, AddTile, LayerGrid } from "./LayerGrid";
import { LayerTile } from "./LayerTile";
import { OpacityBar } from "./OpacityBar";
import { Pager } from "./Pager";
import { Rail } from "./Rail";
import { RailToggle } from "./RailToggle";
import { IconButton, TitleBar } from "./TitleBar";
import {
  CircleHalfIcon,
  EyeIcon,
  EyeSlashIcon,
  InfoIcon,
  UnlockIcon,
  LockIcon,
  SettingsIcon,
  PlusIcon,
  MinusIcon,
  ScaleIcon,
} from "@/components/icons";
import { cn } from "@/utils/cn";
import { LAYERS_PER_PAGE } from "@/utils/matchup-state";
import { useState } from "react";
import type {
  ComponentPropsWithoutRef,
  PointerEvent as ReactPointerEvent,
} from "react";

type Layer = {
  id: string;
  name: string;
  src?: string;
  locked?: boolean;
};

type MatchupPanelProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  layers: Layer[];
  selectedId?: string;
  visible: boolean;
  locked: boolean;
  difference: boolean;
  opacity: number;
  /** Index 0–8 of the active snap point, or null when X/Y are free. */
  anchor: number | null;
  x: string | number;
  y: string | number;
  scale: string | number;
  page?: number;
  error?: string;
  collapsed?: boolean;
  renamingId?: string;
  onToggleVisible?: () => void;
  onToggleLocked?: () => void;
  onToggleDifference?: () => void;
  onOpacityChange?: (value: number) => void;
  onAnchorSelect?: (index: number) => void;
  onPageChange?: (page: number) => void;
  onUpload?: () => void;
  onPaste?: () => void;
  onSelectLayer?: (id: string) => void;
  onStartRename?: (id: string) => void;
  onRenameLayer?: (id: string, name: string) => void;
  onDeleteLayer?: (id: string) => void;
  onReorderLayers?: (fromId: string, toId: string) => void;
  onDismissError?: () => void;
  onTogglePanel?: () => void;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
  /** Settings belong to a layer, so the rail is inert until one is selected. */
  hasSelection?: boolean;
  onXChange?: (value: string) => void;
  onYChange?: (value: string) => void;
  onScaleChange?: (value: string) => void;
  onGripPointerDown?: (event: ReactPointerEvent) => void;
};

const MatchupPanel = ({
  layers,
  selectedId,
  visible,
  locked,
  difference,
  opacity,
  anchor,
  x,
  y,
  scale,
  page = 1,
  error,
  collapsed = false,
  renamingId,
  onToggleVisible,
  onToggleLocked,
  onToggleDifference,
  onOpacityChange,
  onAnchorSelect,
  onPageChange,
  onUpload,
  onPaste,
  onSelectLayer,
  onStartRename,
  onRenameLayer,
  onDeleteLayer,
  onReorderLayers,
  onDismissError,
  onTogglePanel,
  onOpenSettings,
  onOpenHelp,
  hasSelection = true,
  onXChange,
  onYChange,
  onScaleChange,
  onGripPointerDown,
  className,
  ...props
}: MatchupPanelProps) => {
  // Hiding the overlay disables everything below it; lock only freezes position.
  const positionDisabled = locked || !visible;
  const opacityDisabled = !visible;
  const positionEditable = anchor === null && !positionDisabled;

  const [draggingId, setDraggingId] = useState<string>();
  const [overId, setOverId] = useState<string>();
  const pageCount = Math.max(1, Math.ceil(layers.length / LAYERS_PER_PAGE));
  const start = (page - 1) * LAYERS_PER_PAGE;
  const visibleLayers = layers.slice(start, start + LAYERS_PER_PAGE);

  return (
    <div
      className={cn("flex flex-col items-start gap-1 font-sans", className)}
      {...props}
    >
      <Rail
        onPointerDown={onGripPointerDown}
        className="cursor-grab touch-none select-none"
      >
        <button
          type="button"
          onClick={onTogglePanel}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Show panel" : "Hide panel"}
          title={collapsed ? "Show panel (⌥/)" : "Hide panel (⌥/)"}
          className={cn(
            "size-rail-tile rounded-control grid place-items-center relative",
            "bg-rail-tile hover:bg-rail-tile-hover text-muted",
            "transition-colors duration-120 ease-out",
            "focus-visible:ring-[1.5px] focus-visible:ring-accent-blue focus-visible:outline-none",
            !hasSelection && "flex-1",
          )}
        >
          {collapsed ? (
            <PlusIcon className="w-5" />
          ) : (
            <MinusIcon className="w-5" />
          )}
        </button>
        {hasSelection && (
          <div className="flex flex-1">
            <RailToggle
              accent="blue"
              on={visible}
              onClick={onToggleVisible}
              title="Toggle Overlay (⌥V)"
              className="rounded-l-control"
            >
              {visible ? (
                <EyeIcon className="w-5" />
              ) : (
                <EyeSlashIcon className="w-5" />
              )}
            </RailToggle>
            <RailToggle
              accent="yellow"
              on={locked}
              onClick={onToggleLocked}
              title="Toggle Lock (⌥L)"
            >
              {locked ? (
                <LockIcon className="w-5" />
              ) : (
                <UnlockIcon className="w-5" />
              )}
            </RailToggle>
            <RailToggle
              accent="pink"
              on={difference}
              onClick={onToggleDifference}
              title="Toggle Difference (⌥D)"
              className="rounded-r-control"
            >
              <CircleHalfIcon className="w-5" />
            </RailToggle>
          </div>
        )}
      </Rail>

      {!collapsed && (
        <div className="w-panel rounded-panel border-hairline shadow-panel flex-none overflow-hidden border bg-white">
          <TitleBar
            onPointerDown={onGripPointerDown}
            className="cursor-grab touch-none select-none"
            actions={
              <>
                <IconButton aria-label="About" onClick={onOpenHelp}>
                  <InfoIcon className="w-4" />
                </IconButton>
                <IconButton aria-label="Settings" onClick={onOpenSettings}>
                  <SettingsIcon className="w-4" />
                </IconButton>
              </>
            }
          />

          {error && <ErrorBanner message={error} onDismiss={onDismissError} />}

          {layers.length === 0 && (
            <EmptyState onUpload={onUpload} onPaste={onPaste} />
          )}

          {layers.length > 0 && (
            <>
              <LayerGrid>
                {visibleLayers.map((layer) => (
                  <LayerTile
                    key={layer.id}
                    name={layer.name}
                    src={layer.src}
                    selected={layer.id === selectedId}
                    locked={locked && layer.id === selectedId}
                    renaming={layer.id === renamingId}
                    onSelect={() => onSelectLayer?.(layer.id)}
                    onStartRename={() => onStartRename?.(layer.id)}
                    onRename={(next) => onRenameLayer?.(layer.id, next)}
                    onDelete={() => onDeleteLayer?.(layer.id)}
                    lifted={draggingId === layer.id}
                    dropTarget={
                      Boolean(draggingId) &&
                      overId === layer.id &&
                      draggingId !== layer.id
                    }
                    onDragStartLayer={() => setDraggingId(layer.id)}
                    onDropOnLayer={() => {
                      if (draggingId && draggingId !== layer.id) {
                        onReorderLayers?.(draggingId, layer.id);
                      }
                      setDraggingId(undefined);
                      setOverId(undefined);
                    }}
                    onDragEndLayer={() => {
                      setDraggingId(undefined);
                      setOverId(undefined);
                    }}
                    onDragEnter={() => setOverId(layer.id)}
                  />
                ))}
              </LayerGrid>

              {/*
                One footer row: Add on the left, pager on the right. Shown even
                at a single page, so the Add control never moves around and a
                full page can't leave it nowhere to render.
              */}
              <div className="flex items-center justify-between px-3 pb-3">
                <AddButton aria-label="Add layer" onClick={onUpload} />
                <Pager
                  page={page}
                  pageCount={pageCount}
                  onPrev={() => onPageChange?.(page - 1)}
                  onNext={() => onPageChange?.(page + 1)}
                />
              </div>

              <div className="border-hairline border-t p-3">
                <div className="flex items-start gap-3">
                  <AnchorPad
                    selected={anchor}
                    disabled={positionDisabled}
                    onSelect={onAnchorSelect}
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Field
                      label="X"
                      value={x}
                      editable={positionEditable}
                      disabled={positionDisabled}
                      onChange={onXChange}
                    />
                    <Field
                      label="Y"
                      value={y}
                      editable={positionEditable}
                      disabled={positionDisabled}
                      onChange={onYChange}
                    />
                    <Field
                      label={<ScaleIcon className="size-4 " />}
                      value={scale}
                      editable={!positionDisabled}
                      disabled={positionDisabled}
                      onChange={onScaleChange}
                      step={0.1}
                      min={0.01}
                    />
                  </div>
                </div>
              </div>

              <OpacityBar
                value={opacity}
                disabled={opacityDisabled}
                onChange={onOpacityChange}
                className="p-3 pt-0"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export { MatchupPanel };
export type { MatchupPanelProps, Layer };

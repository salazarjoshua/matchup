import { AnchorPad } from "./AnchorPad";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";
import { Field } from "./Field";
import { LayerGrid, UploadTile } from "./LayerGrid";
import { LayerTile } from "./LayerTile";
import { OpacityBar } from "./OpacityBar";
import { Rail } from "./Rail";
import { RailToggle } from "./RailToggle";
import { IconButton } from "./IconButton";
import { TitleBar } from "./TitleBar";
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
import { SHORTCUT_DEFAULTS, shortcutLabel } from "@/utils/matchup-settings";
import { useState } from "react";
import type { Shortcuts } from "@/utils/matchup-settings";
import type {
  ComponentPropsWithoutRef,
  PointerEvent as ReactPointerEvent,
} from "react";

/**
 * The slice of a layer this panel needs. Deliberately structural rather than
 * `MatchupLayer` so the panel stays renderable from a partial layer — but named
 * so it can't be mistaken for a second definition of the layer itself.
 */
type LayerSummary = {
  id: string;
  name: string;
  src?: string;
  locked?: boolean;
};

type MatchupPanelProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  layers: LayerSummary[];
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
  error?: string;
  /** The panel shows its content. Collapsed, only the rail shows. */
  panelOpen?: boolean;
  renamingId?: string;
  onToggleVisible?: () => void;
  onToggleLocked?: () => void;
  onToggleDifference?: () => void;
  onOpacityChange?: (value: number) => void;
  onAnchorSelect?: (index: number) => void;
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
  shortcuts?: Shortcuts;
  onXChange?: (value: string) => void;
  onYChange?: (value: string) => void;
  onScaleChange?: (value: string) => void;
  onGripPointerDown?: (event: ReactPointerEvent) => void;
};

/** Shared by the rail and the title bar, the panel's two drag grips. */
const gripClass = "cursor-grab touch-none select-none";

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
  error,
  panelOpen = true,
  renamingId,
  onToggleVisible,
  onToggleLocked,
  onToggleDifference,
  onOpacityChange,
  onAnchorSelect,
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
  shortcuts = SHORTCUT_DEFAULTS,
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

  return (
    <div
      className={cn("flex flex-col items-start gap-1 font-sans", className)}
      {...props}
    >
      <Rail onPointerDown={onGripPointerDown} className={gripClass}>
        <button
          type="button"
          onClick={onTogglePanel}
          aria-expanded={panelOpen}
          aria-label={panelOpen ? "Hide panel" : "Show panel"}
          title={`${panelOpen ? "Hide" : "Show"} panel (${shortcutLabel(shortcuts.togglePanel)})`}
          className={cn(
            "size-rail-tile rounded-control grid place-items-center relative",
            "bg-rail-tile hover:bg-rail-tile-hover text-muted",
            "transition-colors duration-120 ease-out",
            !hasSelection && "flex-1",
          )}
        >
          {panelOpen ? (
            <MinusIcon className="w-5" />
          ) : (
            <PlusIcon className="w-5" />
          )}
        </button>
        {hasSelection && (
          <div className="flex flex-1">
            <RailToggle
              accent="blue"
              on={visible}
              onClick={onToggleVisible}
              title={`Toggle visibility (${shortcutLabel(shortcuts.toggleVisible)})`}
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
              title={`Toggle lock (${shortcutLabel(shortcuts.toggleLocked)})`}
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
              title={`Toggle difference (${shortcutLabel(shortcuts.toggleDifference)})`}
              className="rounded-r-control"
            >
              <CircleHalfIcon className="w-5" />
            </RailToggle>
          </div>
        )}
      </Rail>

      {panelOpen && (
        <div className="w-panel rounded-panel border-hairline shadow-panel flex-none overflow-hidden border bg-white">
          <TitleBar
            onPointerDown={onGripPointerDown}
            className={gripClass}
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
                {layers.map((layer) => (
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
                {/* Always has a cell now that the grid scrolls. */}
                <div className="flex flex-col">
                  <UploadTile
                    aria-label="Upload an image"
                    title={`Upload an image (${shortcutLabel(shortcuts.upload)})`}
                    onClick={onUpload}
                  />
                </div>
              </LayerGrid>

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
export type { MatchupPanelProps, LayerSummary };

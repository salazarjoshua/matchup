import { AnchorPad } from "./AnchorPad";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";
import { Field } from "./Field";
import { LayerGrid, UploadTile } from "./LayerGrid";
import { LayerTile } from "./LayerTile";
import { OpacityBar } from "./OpacityBar";
import { Segmented } from "./Segmented";
import { DropOverlay } from "./DropOverlay";
import { Toolbar } from "./Toolbar";
import { ToolbarButton } from "./ToolbarButton";
import { ToolbarToggle } from "./ToolbarToggle";
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
  SidePanelIcon,
  PlusIcon,
  MinusIcon,
  ScaleIcon,
} from "@/components/icons";
import { cn } from "@/utils/cn";
import { hasFiles } from "@/utils/drag";
import { SHORTCUT_DEFAULTS, shortcutLabel } from "@/utils/matchup-settings";
import { useRef, useState } from "react";
import type { Shortcuts } from "@/utils/matchup-settings";
import type { BlendMode } from "@/utils/matchup-state";
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
  blendMode: BlendMode;
  /** The overlay holds its place in the window rather than scrolling with the page. */
  pinned: boolean;
  opacity: number;
  /** Index 0–8 of the active snap point, or null when X/Y are free. */
  anchor: number | null;
  x: string | number;
  y: string | number;
  scale: string | number;
  error?: string;
  /** The panel shows its content. Collapsed, only the toolbar shows. */
  panelOpen?: boolean;
  renamingId?: string;
  onToggleVisible?: () => void;
  onToggleLocked?: () => void;
  onToggleInvert?: () => void;
  onPinnedChange?: (pinned: boolean) => void;
  onOpacityChange?: (value: number) => void;
  onAnchorSelect?: (index: number) => void;
  onUpload?: () => void;
  onPaste?: () => void;
  onSelectLayer?: (id: string) => void;
  onStartRename?: (id: string) => void;
  onRenameLayer?: (id: string, name: string) => void;
  onDeleteLayer?: (id: string) => void;
  onReorderLayers?: (fromId: string, toId: string, before: boolean) => void;
  onDismissError?: () => void;
  onDropFiles?: (files: File[]) => void;
  onTogglePanel?: () => void;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
  /** Settings belong to a layer, so the toolbar is inert until one is selected. */
  hasSelection?: boolean;
  shortcuts?: Shortcuts;
  /** False when the panel has a dock of its own: no drag grip, no collapsing. */
  floating?: boolean;
  onToggleSidePanel?: () => void;
  onXChange?: (value: string) => void;
  onYChange?: (value: string) => void;
  onScaleChange?: (value: string) => void;
  onGripPointerDown?: (event: ReactPointerEvent) => void;
};

const gripClass = "cursor-grab touch-none select-none";

/** Naming both states is the point — "not pinned" never said "scrolls with the page". */
const FRAMES = [
  { value: "page", label: "Page" },
  { value: "window", label: "Window" },
] as const;

const MatchupPanel = ({
  layers,
  selectedId,
  visible,
  locked,
  blendMode,
  pinned,
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
  onToggleInvert,
  onPinnedChange,
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
  onDropFiles,
  onTogglePanel,
  onOpenSettings,
  onOpenHelp,
  hasSelection = true,
  shortcuts = SHORTCUT_DEFAULTS,
  floating = true,
  onToggleSidePanel,
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

  // The id is held on a ref as well as in state: state drives the lift, but it lands a
  // frame late, and the drop needs the source synchronously or it silently no-ops.
  const dragging = useRef<string>(undefined);
  const [draggingId, setDraggingId] = useState<string>();
  const [over, setOver] = useState<{ id: string; before: boolean }>();
  const [droppingFiles, setDroppingFiles] = useState(false);

  const endDrag = () => {
    dragging.current = undefined;
    setDraggingId(undefined);
    setOver(undefined);
  };

  return (
    <div className="w-full justify-center items-center flex">
      <div
        className={cn(
          "flex flex-col items-start gap-1 font-sans w-panel",
          className,
        )}
        {...props}
      >
        <Toolbar
          onPointerDown={floating ? onGripPointerDown : undefined}
          className={cn(floating ? gripClass : "w-full")}
        >
          {floating && (
            <ToolbarButton
              onClick={onTogglePanel}
              aria-expanded={panelOpen}
              aria-label={panelOpen ? "Hide panel" : "Show panel"}
              title={`${panelOpen ? "Hide" : "Show"} panel (${shortcutLabel(shortcuts.togglePanel)})`}
              className={cn(
                "rounded-xl hover:bg-toolbar-hover",
                hasSelection ? "w-10" : "flex-1",
              )}
            >
              {panelOpen ? (
                <MinusIcon className="w-5" />
              ) : (
                <PlusIcon className="w-5" />
              )}
            </ToolbarButton>
          )}
          {hasSelection && (
            <div className="flex flex-1">
              <ToolbarToggle
                accent="blue"
                on={visible}
                onClick={onToggleVisible}
                title={`Toggle visibility (${shortcutLabel(shortcuts.toggleVisible)})`}
                className="rounded-l-xl"
              >
                {visible ? (
                  <EyeIcon className="w-5" />
                ) : (
                  <EyeSlashIcon className="w-5" />
                )}
              </ToolbarToggle>
              <ToolbarToggle
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
              </ToolbarToggle>
              <ToolbarToggle
                accent="pink"
                on={blendMode === "invert"}
                onClick={onToggleInvert}
                title={`Toggle invert (${shortcutLabel(shortcuts.toggleInvert)})`}
                className="rounded-r-xl"
              >
                <CircleHalfIcon className="w-5" />
              </ToolbarToggle>
            </div>
          )}
        </Toolbar>

        {(panelOpen || !floating) && (
          <div
            className={cn(
              "rounded-2xl border-hairline shadow-panel flex-none overflow-hidden border bg-white",
              floating ? "w-panel" : "w-full",
            )}
          >
            <TitleBar
              onPointerDown={floating ? onGripPointerDown : undefined}
              className={cn(floating && gripClass)}
              actions={
                <>
                  {onToggleSidePanel && (
                    <IconButton
                      aria-label={
                        floating ? "Open in side panel" : "Show on the page"
                      }
                      title={
                        floating ? "Open in side panel" : "Show on the page"
                      }
                      onClick={onToggleSidePanel}
                    >
                      <SidePanelIcon className="w-4" />
                    </IconButton>
                  )}
                  <IconButton aria-label="About" onClick={onOpenHelp}>
                    <InfoIcon className="w-4" />
                  </IconButton>
                  <IconButton aria-label="Settings" onClick={onOpenSettings}>
                    <SettingsIcon className="w-4" />
                  </IconButton>
                </>
              }
            />

            <div
              className="relative"
              onDragEnter={(event) => {
                if (!hasFiles(event)) return;
                event.preventDefault();
                setDroppingFiles(true);
              }}
              onDragOver={(event) => {
                if (!hasFiles(event)) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
                setDroppingFiles(true);
              }}
              onDragLeave={(event) => {
                // Crossing into a child fires dragleave too, so only a pointer that
                // has left the zone outright may close it.
                if (!hasFiles(event)) return;
                if (event.currentTarget.contains(event.relatedTarget as Node))
                  return;
                setDroppingFiles(false);
              }}
              onDrop={(event) => {
                if (!hasFiles(event)) return;
                event.preventDefault();
                setDroppingFiles(false);
                onDropFiles?.(Array.from(event.dataTransfer.files));
              }}
            >
              {droppingFiles && <DropOverlay />}

              {error && (
                <ErrorBanner message={error} onDismiss={onDismissError} />
              )}

              {layers.length === 0 && (
                <EmptyState onUpload={onUpload} onPaste={onPaste} />
              )}

              {layers.length > 0 && (
                <>
                  <LayerGrid
                    order={layers.map((layer) => layer.id).join()}
                    // The grid is the drop zone, not the tiles: the gaps and padding
                    // between them are dead to a tile-only handler, and the drop line
                    // is drawn in that gap — so you aimed at it and released on nothing.
                    onDragEnter={(event) => {
                      if (hasFiles(event)) return;
                      event.preventDefault();
                    }}
                    onDragOver={(event) => {
                      if (hasFiles(event)) return;
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                    }}
                    onDragLeave={(event) => {
                      if (hasFiles(event)) return;
                      // Fires when crossing into a child too, so only a pointer that has
                      // left the grid outright may take the line away.
                      if (
                        !event.currentTarget.contains(
                          event.relatedTarget as Node,
                        )
                      ) {
                        setOver(undefined);
                      }
                    }}
                    onDrop={(event) => {
                      if (hasFiles(event)) return;
                      event.preventDefault();
                      const from = dragging.current;
                      if (from && over && from !== over.id) {
                        onReorderLayers?.(from, over.id, over.before);
                      }
                      endDrag();
                    }}
                  >
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
                        insertion={
                          draggingId &&
                          draggingId !== layer.id &&
                          over?.id === layer.id
                            ? over.before
                              ? "before"
                              : "after"
                            : undefined
                        }
                        onDragStartLayer={() => {
                          dragging.current = layer.id;
                          // Deferred a frame so the lift lands after dragstart. The ghost
                          // is suppressed, but a host page's CSP can refuse the blank
                          // image and bring it back, and lifting sooner bakes into it.
                          requestAnimationFrame(() => setDraggingId(layer.id));
                        }}
                        // Returns the same object when the edge hasn't changed, so a
                        // dragover firing at pointer rate doesn't re-render the grid.
                        onDragOverLayer={(before) =>
                          setOver((current) =>
                            current?.id === layer.id &&
                            current.before === before
                              ? current
                              : { id: layer.id, before },
                          )
                        }
                        onDragEndLayer={endDrag}
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

                  <div className="border-hairline border-t flex flex-col gap-3 p-3">
                    {/* Above the pad and the fields because it governs both: the
                        nine snap points and X/Y are the page's or the window's,
                        and nothing else on this card says which. */}
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "text-[12px]",
                          positionDisabled ? "text-disabled" : "text-muted",
                        )}
                      >
                        Frame
                      </span>
                      <Segmented
                        className="flex-1"
                        value={pinned ? "window" : "page"}
                        disabled={positionDisabled}
                        options={FRAMES}
                        onChange={(next) => onPinnedChange?.(next === "window")}
                      />
                    </div>
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
          </div>
        )}
      </div>
    </div>
  );
};

export { MatchupPanel };
export type { MatchupPanelProps, LayerSummary };

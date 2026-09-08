import { AnchorPad } from './AnchorPad';
import { EmptyState } from './EmptyState';
import { ErrorBanner } from './ErrorBanner';
import { Field } from './Field';
import { AddTile, LayerGrid, LAYERS_PER_PAGE, MAX_LAYERS } from './LayerGrid';
import { LayerTile } from './LayerTile';
import { OpacityBar } from './OpacityBar';
import { Pager } from './Pager';
import { Rail, RailDivider, RailGrip } from './Rail';
import { RailToggle } from './RailToggle';
import { IconButton, TitleBar } from './TitleBar';
import {
  CircleHalfIcon,
  EyeIcon,
  EyeSlashIcon,
  InfoIcon,
  LockOpenIcon,
  LockSimpleIcon,
  SlidersHorizontalIcon,
} from '@/components/icons';
import { cn } from '@/utils/cn';
import type { ComponentPropsWithoutRef, PointerEvent as ReactPointerEvent } from 'react';

type Layer = {
  id: string;
  name: string;
  src?: string;
  locked?: boolean;
  uploadProgress?: number;
};

type MatchupPanelProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  layers: Layer[];
  selectedId?: string;
  visible: boolean;
  locked: boolean;
  difference: boolean;
  opacity: number;
  /** Index 0–8 of the active snap point, or null when X/Y are free. */
  anchor: number | null;
  x: number;
  y: number;
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

  const pageCount = Math.max(1, Math.ceil(layers.length / LAYERS_PER_PAGE));
  const start = (page - 1) * LAYERS_PER_PAGE;
  const visibleLayers = layers.slice(start, start + LAYERS_PER_PAGE);
  const canAdd = layers.length > 0 && layers.length < MAX_LAYERS && visibleLayers.length < LAYERS_PER_PAGE;

  return (
    <div className={cn('flex items-start gap-3 font-sans', className)} {...props}>
      <Rail>
        <RailGrip onPointerDown={onGripPointerDown} />
        <div className="size-rail-tile grid place-items-center text-[18px] leading-none">🥊</div>
        <RailDivider />
        <RailToggle accent="blue" on={visible} onClick={onToggleVisible} title="Hide overlay  ⌥V">
          {visible ? <EyeIcon /> : <EyeSlashIcon />}
        </RailToggle>
        <RailToggle accent="orange" on={locked} onClick={onToggleLocked} title="Lock position  ⌥L">
          {locked ? <LockSimpleIcon solid /> : <LockOpenIcon />}
        </RailToggle>
        <RailToggle accent="yellow" on={difference} onClick={onToggleDifference} title="Difference  ⌥D">
          <CircleHalfIcon />
        </RailToggle>
      </Rail>

      {!collapsed && (
        <div className="w-panel rounded-panel border-hairline shadow-panel flex-none overflow-hidden border bg-white">
          <TitleBar
            actions={
              <>
                <IconButton aria-label="Settings">
                  <SlidersHorizontalIcon size={16} />
                </IconButton>
                <IconButton aria-label="Shortcuts and help">
                  <InfoIcon size={16} />
                </IconButton>
              </>
            }
          />

          {error && <ErrorBanner message={error} />}

          {layers.length === 0 && !error && <EmptyState onUpload={onUpload} onPaste={onPaste} />}

          {layers.length > 0 && (
            <>
              <LayerGrid>
                {visibleLayers.map(layer => (
                  <LayerTile
                    key={layer.id}
                    name={layer.name}
                    src={layer.src}
                    selected={layer.id === selectedId}
                    locked={locked && layer.id === selectedId}
                    hidden={!visible}
                    uploadProgress={layer.uploadProgress}
                    renaming={layer.id === renamingId}
                    onSelect={() => onSelectLayer?.(layer.id)}
                    onStartRename={() => onStartRename?.(layer.id)}
                    onRename={next => onRenameLayer?.(layer.id, next)}
                    onDelete={() => onDeleteLayer?.(layer.id)}
                  />
                ))}
                {canAdd && <AddTile aria-label="Add layer" onClick={onUpload} />}
              </LayerGrid>

              {layers.length > LAYERS_PER_PAGE && (
                <Pager
                  page={page}
                  pageCount={pageCount}
                  onPrev={() => onPageChange?.(page - 1)}
                  onNext={() => onPageChange?.(page + 1)}
                  className="px-3 pb-3"
                />
              )}

              <div className="border-hairline border-t p-3">
                <div className="flex items-start gap-3">
                  <AnchorPad selected={anchor} disabled={positionDisabled} onSelect={onAnchorSelect} />
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
                      label={
                        <span
                          className={cn(
                            'border-[1.5px] block size-[13px] border-dashed',
                            positionDisabled ? 'border-disabled' : 'border-muted',
                          )}
                        />
                      }
                      value={scale}
                      editable={!positionDisabled}
                      disabled={positionDisabled}
                      onChange={onScaleChange}
                    />
                  </div>
                </div>
              </div>

              <OpacityBar value={opacity} disabled={opacityDisabled} onChange={onOpacityChange} className="p-3" />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export { MatchupPanel };
export type { MatchupPanelProps, Layer };

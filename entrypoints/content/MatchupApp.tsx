import Overlay from '@/components/Overlay';
import { MatchupPanel } from '@/components/matchup';
import {
  ACCEPTED_TYPES,
  LAYERS_PER_PAGE,
  MATCHUP_DEFAULTS,
  MAX_LAYERS,
  matchupState,
} from '@/utils/matchup-state';
import { useCallback, useEffect, useRef, useState } from 'react';
import { browser } from 'wxt/browser';
import type { MatchupState } from '@/utils/matchup-state';
import type { PointerEvent as ReactPointerEvent } from 'react';

const SAVE_DEBOUNCE_MS = 300;

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export default function MatchupApp() {
  const [state, setState] = useState<MatchupState>(MATCHUP_DEFAULTS);
  const [renamingId, setRenamingId] = useState<string>();
  const [error, setError] = useState<string>();
  const [hydrated, setHydrated] = useState(false);

  const fileInput = useRef<HTMLInputElement>(null);
  const dragOffset = useRef<{ dx: number; dy: number } | null>(null);

  const patch = useCallback((next: Partial<MatchupState>) => setState(current => ({ ...current, ...next })), []);

  useEffect(() => {
    matchupState
      .getValue()
      .then(stored => setState({ ...MATCHUP_DEFAULTS, ...stored }))
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  // Debounced so dragging the opacity bar doesn't hammer storage.
  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      matchupState
        .setValue(state)
        .catch(() => setError('Ran out of extension storage. Delete a layer and try again.'));
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [state, hydrated]);

  const addFiles = useCallback(async (files: File[]) => {
    const rejected = files.find(file => !ACCEPTED_TYPES.includes(file.type));
    if (rejected) {
      setError(`${rejected.name || 'That file'} isn’t supported. Use PNG, JPG, WebP or SVG.`);
      return;
    }
    setError(undefined);
    const decoded = await Promise.all(
      files.map(async file => ({
        id: crypto.randomUUID(),
        name: file.name || 'pasted.png',
        src: await readAsDataUrl(file),
      })),
    );
    setState(current => {
      const added = decoded.slice(0, MAX_LAYERS - current.layers.length);
      if (added.length === 0) return current;
      return {
        ...current,
        layers: [...current.layers, ...added],
        selectedId: current.selectedId ?? added[0]?.id,
      };
    });
  }, []);

  const pasteFromClipboard = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      const files: File[] = [];
      for (const item of items) {
        const type = item.types.find(candidate => ACCEPTED_TYPES.includes(candidate));
        if (!type) continue;
        files.push(new File([await item.getType(type)], `pasted.${type.split('/')[1]}`, { type }));
      }
      if (files.length === 0) {
        setError('No image on the clipboard. Copy an image, then try again.');
        return;
      }
      await addFiles(files);
    } catch {
      setError('Couldn’t read the clipboard. Press ⌘V over the page instead.');
    }
  }, [addFiles]);

  useEffect(() => {
    const onMessage = (message: unknown) => {
      if ((message as { type?: string })?.type === 'matchup:toggle') {
        setState(current => ({ ...current, open: !current.open }));
      }
    };
    browser.runtime.onMessage.addListener(onMessage);
    return () => browser.runtime.onMessage.removeListener(onMessage);
  }, []);

  const open = state.open;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === 'v') setState(c => ({ ...c, visible: !c.visible }));
      else if (key === 'l') setState(c => ({ ...c, locked: !c.locked }));
      else if (key === 'd') setState(c => ({ ...c, difference: !c.difference }));
      else if (event.key === '[') setState(c => ({ ...c, page: Math.max(1, c.page - 1) }));
      else if (event.key === ']') setState(c => ({ ...c, page: c.page + 1 }));
      else return;
      event.preventDefault();
    };
    const onPaste = (event: ClipboardEvent) => {
      const files = Array.from(event.clipboardData?.files ?? []);
      if (files.length > 0) {
        event.preventDefault();
        void addFiles(files);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('paste', onPaste, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('paste', onPaste, true);
    };
  }, [open, addFiles]);

  const onGripPointerDown = (event: ReactPointerEvent) => {
    dragOffset.current = { dx: event.clientX - state.origin.left, dy: event.clientY - state.origin.top };
    const onMove = (move: PointerEvent) => {
      if (!dragOffset.current) return;
      patch({ origin: { left: move.clientX - dragOffset.current.dx, top: move.clientY - dragOffset.current.dy } });
    };
    const onUp = () => {
      dragOffset.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  if (!hydrated || !open) return null;

  const selected = state.layers.find(layer => layer.id === state.selectedId);
  const pageCount = Math.max(1, Math.ceil(state.layers.length / LAYERS_PER_PAGE));

  return (
    <>
      {selected?.src && state.visible && (
        <Overlay
          src={selected.src}
          anchor={state.anchor}
          x={Number(state.x) || 0}
          y={Number(state.y) || 0}
          scale={Number(state.scale) || 1}
          opacity={state.opacity}
          difference={state.difference}
        />
      )}

      <input
        ref={fileInput}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        multiple
        hidden
        onChange={event => {
          void addFiles(Array.from(event.currentTarget.files ?? []));
          event.currentTarget.value = '';
        }}
      />

      <div style={{ position: 'fixed', left: state.origin.left, top: state.origin.top, zIndex: 2147483647 }}>
        <MatchupPanel
          layers={state.layers}
          selectedId={state.selectedId}
          renamingId={renamingId}
          visible={state.visible}
          locked={state.locked}
          difference={state.difference}
          opacity={state.opacity}
          anchor={state.anchor}
          x={state.x}
          y={state.y}
          scale={state.scale}
          page={Math.min(state.page, pageCount)}
          error={error}
          onToggleVisible={() => patch({ visible: !state.visible })}
          onToggleLocked={() => patch({ locked: !state.locked })}
          onToggleDifference={() => patch({ difference: !state.difference })}
          onOpacityChange={opacity => patch({ opacity })}
          onAnchorSelect={index => patch({ anchor: state.anchor === index ? null : index })}
          onPageChange={next => patch({ page: Math.min(Math.max(1, next), pageCount) })}
          onUpload={() => fileInput.current?.click()}
          onPaste={() => void pasteFromClipboard()}
          onDismissError={() => setError(undefined)}
          onSelectLayer={id => patch({ selectedId: id })}
          onStartRename={setRenamingId}
          onRenameLayer={(id, name) => {
            patch({ layers: state.layers.map(layer => (layer.id === id ? { ...layer, name } : layer)) });
            setRenamingId(undefined);
          }}
          onDeleteLayer={id => {
            const remaining = state.layers.filter(layer => layer.id !== id);
            patch({ layers: remaining, selectedId: state.selectedId === id ? remaining[0]?.id : state.selectedId });
          }}
          onXChange={x => patch({ x })}
          onYChange={y => patch({ y })}
          onScaleChange={scale => patch({ scale })}
          onGripPointerDown={onGripPointerDown}
        />
      </div>
    </>
  );
}

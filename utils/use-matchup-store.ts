import {
  ACCEPTED_TYPES,
  LAYER_DEFAULTS,
  MATCHUP_DEFAULTS,
  lockAspect,
  restoreState,
  storesFor,
} from "./matchup-state";
import {
  SETTINGS_DEFAULTS,
  matchupSettings,
  restoreSettings,
} from "./matchup-settings";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { browser } from "wxt/browser";
import type {
  DrawnLayer,
  LayerSettings,
  LayerSize,
  LayerSources,
  MatchupState,
} from "./matchup-state";
import type { MatchupSettings } from "./matchup-settings";

/**
 * Throttled, not debounced. A debounce restarts on every change, so dragging a slider
 * cancelled the pending write over and over and nothing reached the other panel until
 * the pointer stopped — which read as a long delay rather than as no write at all.
 * Affordable at this rate only because images no longer travel with the record.
 */
const WRITE_INTERVAL_MS = 60;
const MAX_NAME = 16;
const ACCEPTED_COPY = "Use PNG, JPG, WebP or SVG.";

const shortName = (name: string) => {
  if (name.length <= MAX_NAME) return name;
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot) : "";
  return `${name.slice(0, Math.max(1, MAX_NAME - ext.length - 1))}…${ext}`;
};

const rejectionMessage = (rejected: File[], addedAny: boolean) => {
  const one = rejected.length === 1;
  const what = one
    ? shortName(rejected[0]?.name || "one file")
    : `${rejected.length} files`;
  if (addedAny) return `Skipped ${what}. ${ACCEPTED_COPY}`;
  return one
    ? `${what} isn’t supported. ${ACCEPTED_COPY}`
    : `${what} aren’t supported. ${ACCEPTED_COPY}`;
};

/**
 * The image's own size, so a new layer opens at the size it was drawn at and the
 * aspect lock has a ratio to hold to. Resolves to nothing rather than rejecting on a
 * failure or on an SVG with no intrinsic size — the overlay falls back to laying the
 * image out itself, which is what it did before any of this was stored.
 */
const measure = (src: string) =>
  new Promise<Partial<LayerSize>>((resolve) => {
    const image = new Image();
    image.onload = () =>
      resolve(
        image.naturalWidth > 0 && image.naturalHeight > 0
          ? {
              width: String(image.naturalWidth),
              height: String(image.naturalHeight),
              naturalWidth: image.naturalWidth,
              naturalHeight: image.naturalHeight,
            }
          : {},
      );
    image.onerror = () => resolve({});
    image.src = src;
  });

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export const useMatchupSettings = (): MatchupSettings => {
  const [prefs, setPrefs] = useState<MatchupSettings>(SETTINGS_DEFAULTS);
  useEffect(() => {
    matchupSettings
      .getValue()
      .then((stored) => setPrefs(restoreSettings(stored)))
      .catch(() => undefined);
    return matchupSettings.watch((next) => setPrefs(restoreSettings(next)));
  }, []);
  return prefs;
};

/**
 * One origin's layers, shared by whichever contexts have Matchup open. Both panels mount
 * this against the same two stores, so neither needs to know the other exists — a write
 * on one side arrives on the other as a storage change.
 */
export const useMatchupStore = (
  origin: string | undefined,
  prefs: MatchupSettings,
) => {
  const [state, setState] = useState<MatchupState>(MATCHUP_DEFAULTS);
  const [sources, setSources] = useState<LayerSources>({});
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string>();
  const [renamingId, setRenamingId] = useState<string>();

  const defaults = useRef(prefs.layerDefaults);
  defaults.current = prefs.layerDefaults;
  /**
   * The record as last written or last received. storage.onChanged reaches the writer
   * too, so without this each side adopts its own echo, re-renders, and writes again —
   * a ping-pong that costs a round trip every time. Comparing whole records is cheap
   * now that they carry no image data.
   */
  const synced = useRef<string>(undefined);
  const lastWriteAt = useRef(0);

  useEffect(() => {
    if (!origin) return;
    const store = storesFor(origin);
    let live = true;
    setHydrated(false);

    void Promise.all([store.state.getValue(), store.sources.getValue()])
      .then(([storedState, storedSources]) => {
        if (!live) return;
        const restored = restoreState(storedState);
        synced.current = JSON.stringify(restored);
        setState(restored);
        setSources(storedSources ?? {});
      })
      .catch(() => undefined)
      .finally(() => live && setHydrated(true));

    const unwatchState = store.state.watch((next) => {
      const restored = restoreState(next);
      const serialised = JSON.stringify(restored);
      if (serialised === synced.current) return;
      synced.current = serialised;
      setState(restored);
    });
    const unwatchSources = store.sources.watch((next) =>
      setSources(next ?? {}),
    );
    return () => {
      live = false;
      unwatchState();
      unwatchSources();
    };
  }, [origin]);

  useEffect(() => {
    if (!origin || !hydrated) return;
    const serialised = JSON.stringify(state);
    if (serialised === synced.current) return;
    // Time since the last write, not since the last change: a continuous drag keeps
    // landing on the same deadline and so keeps writing at a steady rate.
    const wait = Math.max(
      0,
      WRITE_INTERVAL_MS - (Date.now() - lastWriteAt.current),
    );
    const timer = setTimeout(() => {
      lastWriteAt.current = Date.now();
      synced.current = serialised;
      storesFor(origin)
        .state.setValue(state)
        .catch(() => setError("Couldn’t save. Try again."));
    }, wait);
    return () => clearTimeout(timer);
  }, [state, hydrated, origin]);

  /** Joined for rendering; nothing downstream has to know the two stores are separate. */
  const layers: DrawnLayer[] = useMemo(
    () => state.layers.map((layer) => ({ ...layer, src: sources[layer.id] })),
    [state.layers, sources],
  );

  const patch = useCallback(
    (next: Partial<MatchupState>) =>
      setState((current) => ({ ...current, ...next })),
    [],
  );

  /** Settings live on the layer, so every edit targets the selected one. */
  const patchLayer = useCallback(
    (next: Partial<LayerSettings & LayerSize>) =>
      setState((current) => ({
        ...current,
        layers: current.layers.map((layer) =>
          layer.id === current.selectedId ? { ...layer, ...next } : layer,
        ),
      })),
    [],
  );

  const addFiles = useCallback(
    async (files: File[]) => {
      if (!origin) return;
      // Partitioned rather than rejected outright: a dropped folder selection is often
      // mostly usable, and throwing all of it away over one stray file is harsh.
      const accepted = files.filter((file) =>
        ACCEPTED_TYPES.includes(file.type),
      );
      const rejected = files.filter(
        (file) => !ACCEPTED_TYPES.includes(file.type),
      );

      if (accepted.length > 0) {
        const decoded = await Promise.all(
          accepted.map(async (file) => {
            const src = await readAsDataUrl(file);
            return {
              meta: {
                ...defaults.current,
                ...(await measure(src)),
                id: crypto.randomUUID(),
                name: file.name || "pasted.png",
              },
              src,
            };
          }),
        );
        const store = storesFor(origin);
        // Sources are written straight through rather than debounced: they change only
        // here and on delete, and the meta record below refers to them.
        const nextSources = { ...(await store.sources.getValue()) };
        for (const { meta, src } of decoded) nextSources[meta.id] = src;
        await store.sources
          .setValue(nextSources)
          .catch(() =>
            setError("Ran out of extension storage. Delete a layer first."),
          );
        setSources(nextSources);
        setState((current) => ({
          ...current,
          layers: [...current.layers, ...decoded.map((d) => d.meta)],
          selectedId: decoded[decoded.length - 1]?.meta.id,
        }));
      }

      setError(
        rejected.length > 0
          ? rejectionMessage(rejected, accepted.length > 0)
          : undefined,
      );
    },
    [origin],
  );

  const deleteLayer = useCallback(
    (id: string) => {
      setState((current) => {
        const remaining = current.layers.filter((layer) => layer.id !== id);
        return {
          ...current,
          layers: remaining,
          selectedId:
            current.selectedId === id ? remaining[0]?.id : current.selectedId,
        };
      });
      if (!origin) return;
      const store = storesFor(origin);
      void store.sources.getValue().then((stored) => {
        const next = { ...stored };
        delete next[id];
        setSources(next);
        return store.sources.setValue(next);
      });
    },
    [origin],
  );

  const pasteFromClipboard = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      const files: File[] = [];
      for (const item of items) {
        const type = item.types.find((candidate) =>
          ACCEPTED_TYPES.includes(candidate),
        );
        if (!type) continue;
        files.push(
          new File([await item.getType(type)], `pasted.${type.split("/")[1]}`, {
            type,
          }),
        );
      }
      if (files.length === 0) {
        setError("No image on the clipboard.");
        return;
      }
      await addFiles(files);
    } catch {
      setError("Couldn’t read the clipboard. Press ⌘V over the page instead.");
    }
  }, [addFiles]);

  /**
   * A picker that never has to be in the tree. The upload shortcut fires from the page
   * even while the panel is docked in the side panel, so there is nowhere to hang a
   * hidden <input> that is reliably mounted at the time.
   */
  const pickFiles = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ACCEPTED_TYPES.join(",");
    input.multiple = true;
    input.onchange = () => void addFiles(Array.from(input.files ?? []));
    input.click();
  }, [addFiles]);

  const renameLayer = useCallback((id: string, name: string) => {
    setState((current) => ({
      ...current,
      layers: current.layers.map((layer) =>
        layer.id === id ? { ...layer, name } : layer,
      ),
    }));
    setRenamingId(undefined);
  }, []);

  const reorderLayers = useCallback(
    (fromId: string, toId: string, before: boolean) =>
      setState((current) => {
        const from = current.layers.findIndex((l) => l.id === fromId);
        const target = current.layers.findIndex((l) => l.id === toId);
        if (from < 0 || target < 0 || from === target) return current;
        const layers = [...current.layers];
        const [moved] = layers.splice(from, 1);
        if (!moved) return current;
        // Pulling the layer out shifts the target down one when it sat after it.
        const at = from < target ? target - 1 : target;
        layers.splice(before ? at : at + 1, 0, moved);
        return { ...current, layers };
      }),
    [],
  );

  const selected = layers.find((layer) => layer.id === state.selectedId);
  const settings = (selected ?? LAYER_DEFAULTS) as LayerSettings &
    Partial<LayerSize>;

  /**
   * Everything the panel needs that is the same wherever it is mounted. The page and
   * the side panel each spread this and add only what differs — where it is docked,
   * and how an anchor resolves once a frame is known.
   */
  const panelProps = {
    layers,
    selectedId: state.selectedId,
    renamingId,
    shortcuts: prefs.shortcuts,
    visible: settings.visible,
    locked: settings.locked,
    invert: settings.invert,
    pinned: settings.pinned,
    opacity: settings.opacity,
    anchor: settings.anchor,
    x: settings.x,
    y: settings.y,
    width: settings.width ?? "",
    height: settings.height ?? "",
    scale: settings.scale,
    error,
    hasSelection: Boolean(selected),
    onOpenSettings: () =>
      void browser.runtime.sendMessage({ type: "matchup:open-settings" }),
    onOpenHelp: () =>
      void browser.runtime.sendMessage({ type: "matchup:open-help" }),
    onToggleVisible: () => patchLayer({ visible: !settings.visible }),
    onToggleLocked: () => patchLayer({ locked: !settings.locked }),
    onToggleInvert: () => patchLayer({ invert: !settings.invert }),
    // Only the flag: the page converts the coordinates on the way through, because
    // it is the only side that knows how far it is scrolled.
    onPinnedChange: (pinned: boolean) => patchLayer({ pinned }),
    onOpacityChange: (opacity: number) => patchLayer({ opacity }),
    onAnchorSelect: (index: number) =>
      patchLayer({ anchor: settings.anchor === index ? null : index }),
    onUpload: pickFiles,
    onPaste: () => void pasteFromClipboard(),
    onAddFiles: (files: File[]) => void addFiles(files),
    onDismissError: () => setError(undefined),
    onSelectLayer: (id: string) => patch({ selectedId: id }),
    onStartRename: setRenamingId,
    onRenameLayer: renameLayer,
    onReorderLayers: reorderLayers,
    onDeleteLayer: deleteLayer,
    // Typing a position is as much a release from the snap point as dragging away
    // from it is; leaving the anchor set would re-solve the layer back on top.
    onXChange: (x: string) => patchLayer({ x, anchor: null }),
    onYChange: (y: string) => patchLayer({ y, anchor: null }),
    onWidthChange: (width: string) =>
      patchLayer(lockAspect(settings, "width", width)),
    onHeightChange: (height: string) =>
      patchLayer(lockAspect(settings, "height", height)),
    onScaleChange: (scale: string) => patchLayer({ scale }),
  };

  return {
    state,
    setState,
    selected,
    settings,
    hydrated,
    pickFiles,
    patch,
    patchLayer,
    addFiles,
    panelProps,
  };
};

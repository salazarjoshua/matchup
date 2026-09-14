import { storage } from "wxt/utils/storage";

/** Everything a layer remembers on its own — images differ in size, so these can't be global. */
export type LayerSettings = {
  visible: boolean;
  locked: boolean;
  difference: boolean;
  /** 0–100. */
  opacity: number;
  /** Index 0–8 of the active snap point, or null when x/y are free. */
  anchor: number | null;
  /**
   * The overlay holds its place in the window instead of travelling with the page.
   * Off by default: most things worth comparing — an email, a long landing page —
   * run past one screenful, and an image that stays put can only ever be checked
   * against the first of them.
   */
  pinned: boolean;
  x: string;
  y: string;
  scale: string;
};

/**
 * Deliberately without the image. Every tweak of a slider rewrites this record, and a
 * layer's data URL runs to megabytes — carrying one through each write is what made the
 * side panel crawl. Sources live in their own store and are written only on add or delete.
 */
export type MatchupLayer = LayerSettings & {
  id: string;
  name: string;
};

/** Layer id → data URL. Object URLs do not survive a page reload, so these are inline. */
export type LayerSources = Record<string, string>;

/** A layer with its image joined back on, which is all any component ever wants. */
export type DrawnLayer = MatchupLayer & { src?: string };

export type MatchupState = {
  layers: MatchupLayer[];
  selectedId?: string;
  /** The panel shows its content. Collapsed, only the toolbar remains. */
  panelOpen: boolean;
};

export const LAYER_DEFAULTS: LayerSettings = {
  visible: true,
  locked: false,
  difference: false,
  opacity: 50,
  anchor: null,
  pinned: false,
  x: "0",
  y: "0",
  scale: "0.5",
};

export const MATCHUP_DEFAULTS: MatchupState = {
  layers: [],
  panelOpen: true,
};

/**
 * Rebuilds stored state from only the keys this version knows about. `open`, `dock` and
 * `page` used to live here before they became per-tab or went away, and spreading the stored
 * object would carry those dead keys forward and keep re-saving them.
 */
export const restoreState = (stored?: Partial<MatchupState>): MatchupState => ({
  // Each layer is rebuilt over the defaults too, so a settings key added in a later
  // version reaches layers that were stored before it existed.
  layers: Array.isArray(stored?.layers)
    ? stored.layers.map((layer) => ({ ...LAYER_DEFAULTS, ...layer }))
    : MATCHUP_DEFAULTS.layers,
  selectedId:
    typeof stored?.selectedId === "string" ? stored.selectedId : undefined,
  panelOpen:
    typeof stored?.panelOpen === "boolean"
      ? stored.panelOpen
      : MATCHUP_DEFAULTS.panelOpen,
});

export const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];
/**
 * Columns in the layer grid — the knob for trying out tile densities. There is
 * no row limit: the grid scrolls, so it holds as many layers as you add.
 * How tall it gets before scrolling is the `max-h-*` on LayerGrid.
 */
export const LAYER_COLUMNS = 3;

/**
 * Keyed by origin: a mockup belongs to the site it was drawn for, and one shared store
 * meant every page opened with someone else's layers. Memoised because `watch` registers
 * against the item, so each origin needs one and the same instance everywhere.
 */
const stores = new Map<string, ReturnType<typeof defineStores>>();

const defineStores = (origin: string) => ({
  state: storage.defineItem<MatchupState>(`local:matchup-state:${origin}`, {
    fallback: MATCHUP_DEFAULTS,
  }),
  sources: storage.defineItem<LayerSources>(
    `local:matchup-sources:${origin}`,
    { fallback: {} },
  ),
});

export const storesFor = (origin: string) => {
  const existing = stores.get(origin);
  if (existing) return existing;
  const created = defineStores(origin);
  stores.set(origin, created);
  return created;
};

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
  x: string;
  y: string;
  scale: string;
};

export type MatchupLayer = LayerSettings & {
  id: string;
  name: string;
  /** Data URL — object URLs do not survive a page reload. */
  src: string;
};

export type MatchupState = {
  layers: MatchupLayer[];
  selectedId?: string;
  /** The panel shows its content. Collapsed, only the rail remains. */
  panelOpen: boolean;
};

export const LAYER_DEFAULTS: LayerSettings = {
  visible: true,
  locked: false,
  difference: false,
  opacity: 50,
  anchor: null,
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
  layers: Array.isArray(stored?.layers)
    ? stored.layers
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

export const matchupState = storage.defineItem<MatchupState>(
  "local:matchup-state",
  {
    fallback: MATCHUP_DEFAULTS,
  },
);

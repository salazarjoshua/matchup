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
  page: number;
  /** The panel is expanded beside the rail. Toggled by the glove. */
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
  page: 1,
  panelOpen: true,
};

/**
 * Rebuilds stored state from only the keys this version knows about. `open` and
 * `dock` used to live here before they became per-tab, and spreading the stored
 * object would carry those dead keys forward and keep re-saving them.
 */
export const restoreState = (stored?: Partial<MatchupState>): MatchupState => ({
  layers: Array.isArray(stored?.layers)
    ? stored.layers
    : MATCHUP_DEFAULTS.layers,
  selectedId:
    typeof stored?.selectedId === "string" ? stored.selectedId : undefined,
  page: typeof stored?.page === "number" ? stored.page : MATCHUP_DEFAULTS.page,
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
 * Layer grid layout — the knob for trying out panel densities. Columns drives
 * the CSS grid, rows drives how tall a page is; change either and the grid, the
 * pager and the page-jump after an upload all follow.
 */
export const LAYER_GRID = { columns: 3, rows: 2 } as const;

/** Derived, never set by hand: one page is exactly one full grid. */
export const LAYERS_PER_PAGE = LAYER_GRID.columns * LAYER_GRID.rows;

export const matchupState = storage.defineItem<MatchupState>(
  "local:matchup-state",
  {
    fallback: MATCHUP_DEFAULTS,
  },
);

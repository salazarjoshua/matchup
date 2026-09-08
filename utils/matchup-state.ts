import { storage } from 'wxt/utils/storage';

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
  /** Matchup is active on this tab at all. Toggled from the toolbar popup. */
  open: boolean;
  /** The panel is expanded beside the rail. Toggled by the glove. */
  panelOpen: boolean;
  origin: { left: number; top: number };
};

export const LAYER_DEFAULTS: LayerSettings = {
  visible: true,
  locked: false,
  difference: false,
  opacity: 50,
  anchor: 0,
  x: '0',
  y: '0',
  scale: '1',
};

export const MATCHUP_DEFAULTS: MatchupState = {
  layers: [],
  page: 1,
  open: false,
  panelOpen: true,
  origin: { left: 16, top: 16 },
};

export const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
export const LAYERS_PER_PAGE = 6;

export const matchupState = storage.defineItem<MatchupState>('local:matchup-state', {
  fallback: MATCHUP_DEFAULTS,
});

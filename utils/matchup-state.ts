import { storage } from 'wxt/utils/storage';

export type MatchupLayer = {
  id: string;
  name: string;
  /** Data URL — object URLs do not survive a page reload. */
  src: string;
};

export type MatchupState = {
  layers: MatchupLayer[];
  selectedId?: string;
  visible: boolean;
  locked: boolean;
  difference: boolean;
  opacity: number;
  /** Index 0–8 of the active snap point, or null when x/y are free. */
  anchor: number | null;
  x: string;
  y: string;
  scale: string;
  page: number;
  open: boolean;
  origin: { left: number; top: number };
};

export const MATCHUP_DEFAULTS: MatchupState = {
  layers: [],
  visible: true,
  locked: false,
  difference: false,
  opacity: 50,
  anchor: 0,
  x: '0',
  y: '0',
  scale: '1',
  page: 1,
  open: false,
  origin: { left: 16, top: 16 },
};

export const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
export const MAX_LAYERS = 8;
export const LAYERS_PER_PAGE = 6;

export const matchupState = storage.defineItem<MatchupState>('local:matchup-state', {
  fallback: MATCHUP_DEFAULTS,
});

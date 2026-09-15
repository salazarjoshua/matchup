import { LAYER_DEFAULTS } from "./matchup-state";
import { storage } from "wxt/utils/storage";
import type { LayerSettings } from "./matchup-state";

export type PanelCorner =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export type MatchupSettings = {
  /** Where the panel first appears, before it has been dragged anywhere. */
  panelPosition: PanelCorner;
  /** Applied to every newly added layer. */
  layerDefaults: LayerSettings;
  /** Action → physical key. The ⌥ modifier is fixed. */
  shortcuts: Shortcuts;
};

export const PANEL_CORNERS: { value: PanelCorner; label: string }[] = [
  { value: "top-left", label: "top left" },
  { value: "top-right", label: "top right" },
  { value: "bottom-left", label: "bottom left" },
  { value: "bottom-right", label: "bottom right" },
];

export const ANCHOR_LABELS = [
  "top left",
  "top center",
  "top right",
  "middle left",
  "center",
  "middle right",
  "bottom left",
  "bottom center",
  "bottom right",
];

export type ShortcutAction =
  | "togglePanel"
  | "toggleVisible"
  | "toggleLocked"
  | "toggleInvert"
  | "upload";

export type Shortcuts = Record<ShortcutAction, string>;

export const SHORTCUT_DEFAULTS: Shortcuts = {
  togglePanel: "Backquote",
  toggleVisible: "Digit1",
  toggleLocked: "Digit2",
  toggleInvert: "Digit3",
  upload: "KeyU",
};

export const LAYER_SHORTCUTS: { action: ShortcutAction; label: string }[] = [
  { action: "togglePanel", label: "Toggle panel" },
  { action: "toggleVisible", label: "Toggle visibility" },
  { action: "toggleLocked", label: "Toggle lock" },
  { action: "toggleInvert", label: "Toggle invert" },
];

export const IMAGE_SHORTCUTS: { action: ShortcutAction; label: string }[] = [
  { action: "upload", label: "Upload image" },
];

/** Action → its label, derived so the groups above stay the single source. */
export const SHORTCUT_LABELS = Object.fromEntries(
  [...IMAGE_SHORTCUTS, ...LAYER_SHORTCUTS].map(({ action, label }) => [
    action,
    label,
  ]),
) as Record<ShortcutAction, string>;

const PUNCTUATION_LABELS: Record<string, string> = {
  Slash: "/",
  Backslash: "\\",
  BracketLeft: "[",
  BracketRight: "]",
  Semicolon: ";",
  Quote: "'",
  Comma: ",",
  Period: ".",
  Minus: "-",
  Equal: "=",
  Backquote: "`",
};

/** "KeyV" → "V", "Digit1" → "1", "Slash" → "/". */
const keyLabel = (code: string) =>
  PUNCTUATION_LABELS[code] ??
  (code.startsWith("Key")
    ? code.slice(3)
    : code.startsWith("Digit")
      ? code.slice(5)
      : code);

/** The chord as the user sees it. ⌥ is fixed — see `isBindableKey`. */
export const shortcutLabel = (code: string) => `⌥${keyLabel(code)}`;

/**
 * Which physical keys may be bound. Letters, digits and common punctuation
 * only: the modifier stays ⌥, so anything needing a different one (arrows,
 * function keys, Tab) is out of scope and would collide with the browser.
 */
export const isBindableKey = (code: string) =>
  /^Key[A-Z]$/.test(code) ||
  /^Digit[0-9]$/.test(code) ||
  code in PUNCTUATION_LABELS;

export const SETTINGS_DEFAULTS: MatchupSettings = {
  panelPosition: "top-right",
  layerDefaults: LAYER_DEFAULTS,
  shortcuts: SHORTCUT_DEFAULTS,
};

/**
 * Rebuilt from the actions this version knows about rather than spread over
 * them: a renamed action leaves its old key in storage still holding a code,
 * and the lookup that resolves a keypress would match that dead entry first
 * and swallow the chord.
 */
const restoreShortcuts = (stored?: Partial<Shortcuts>): Shortcuts =>
  Object.fromEntries(
    (Object.keys(SHORTCUT_DEFAULTS) as ShortcutAction[]).map((action) => [
      action,
      stored?.[action] ?? SHORTCUT_DEFAULTS[action],
    ]),
  ) as Shortcuts;

/**
 * Merges stored settings over the defaults one level deep. A plain spread would
 * drop keys inside `layerDefaults` whenever storage predates a newly added one,
 * leaving a layer default undefined.
 */
export const restoreSettings = (
  stored?: Partial<MatchupSettings>,
): MatchupSettings => ({
  panelPosition: stored?.panelPosition ?? SETTINGS_DEFAULTS.panelPosition,
  layerDefaults: { ...LAYER_DEFAULTS, ...stored?.layerDefaults },
  shortcuts: restoreShortcuts(stored?.shortcuts),
});

export const matchupSettings = storage.defineItem<MatchupSettings>(
  "local:matchup-settings",
  {
    fallback: SETTINGS_DEFAULTS,
  },
);

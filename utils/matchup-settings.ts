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

export const HOTKEYS = [
  { keys: "⌥V", action: "Toggle visibility" },
  { keys: "⌥L", action: "Toggle lock" },
  { keys: "⌥D", action: "Toggle difference" },
  { keys: "⌥/", action: "Toggle panel" },
  { keys: "⌥[", action: "Previous page" },
  { keys: "⌥]", action: "Next page" },
  { keys: "⌘V", action: "Paste an image" },
];

export const SETTINGS_DEFAULTS: MatchupSettings = {
  panelPosition: "top-right",
  layerDefaults: LAYER_DEFAULTS,
};

export const matchupSettings = storage.defineItem<MatchupSettings>(
  "local:matchup-settings",
  {
    fallback: SETTINGS_DEFAULTS,
  },
);

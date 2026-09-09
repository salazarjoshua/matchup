import { LAYER_DEFAULTS } from "./matchup-state";
import { storage } from "wxt/utils/storage";
import type { LayerSettings } from "./matchup-state";

export type PanelCorner =
  "top-left" | "top-right" | "bottom-left" | "bottom-right";

export type MatchupSettings = {
  /** Where the panel first appears, before it has been dragged anywhere. */
  panelPosition: PanelCorner;
  /** Applied to every newly added layer. */
  layerDefaults: LayerSettings;
};

export const PANEL_CORNERS: { value: PanelCorner; label: string }[] = [
  { value: "top-left", label: "Top left" },
  { value: "top-right", label: "Top right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-right", label: "Bottom right" },
];

export const ANCHOR_LABELS = [
  "Top left",
  "Top centre",
  "Top right",
  "Middle left",
  "Centre",
  "Middle right",
  "Bottom left",
  "Bottom centre",
  "Bottom right",
];

export const HOTKEYS = [
  { keys: "⌥V", action: "Show or hide the overlay" },
  { keys: "⌥L", action: "Lock the layer’s position" },
  { keys: "⌥D", action: "Toggle difference blending" },
  { keys: "⌥[", action: "Previous page of layers" },
  { keys: "⌥]", action: "Next page of layers" },
  { keys: "⌘V", action: "Paste an image from the clipboard" },
];

export const SETTINGS_DEFAULTS: MatchupSettings = {
  panelPosition: "top-left",
  layerDefaults: LAYER_DEFAULTS,
};

export const matchupSettings = storage.defineItem<MatchupSettings>(
  "local:matchup-settings",
  {
    fallback: SETTINGS_DEFAULTS,
  },
);

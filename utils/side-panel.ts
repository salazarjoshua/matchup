/**
 * Both sides register with the background rather than with each other. A port aimed at a
 * content script dies on every navigation, and the tab id it was keyed on does not change
 * — so nothing reconnected and a refreshed page never learned the side panel was there.
 * The background outlives both, and hands a freshly injected page the answer on request.
 */
export const SIDE_PANEL_PORT = "matchup:side-panel";
export const ASK_REMOTE = "matchup:remote?";
export const TELL_REMOTE = "matchup:remote";

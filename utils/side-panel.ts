/**
 * Both sides register with the background rather than with each other. A port aimed at a
 * content script dies on every navigation, and the tab id it was keyed on does not change
 * — so nothing reconnected and a refreshed page never learned the side panel was there.
 * The background outlives both, and greets a freshly injected page on its own.
 */
export const SIDE_PANEL_PORT = "matchup:side-panel";

/** Page → background, on mount and whenever Matchup is toggled there. Carries the only
 *  copy of that flag, which lives in the page's own sessionStorage. */
export const PAGE_STATE = "matchup:page-state";

/** Background → page: a side panel is showing this tab, so stand down. */
export const TELL_REMOTE = "matchup:remote";

/** Pages that run no content script, so Matchup has nothing to attach to. */
const RESTRICTED = [
  "about:",
  "chrome:",
  "edge:",
  "chrome-extension:",
  "moz-extension:",
  "https://chromewebstore.google.com",
  "https://addons.mozilla.org",
];

export const isRestricted = (url?: string) =>
  !url || RESTRICTED.some((prefix) => url.startsWith(prefix));

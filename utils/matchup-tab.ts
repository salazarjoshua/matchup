/**
 * Where the widget sits, stored as a distance from whichever edges it is nearest.
 * Docking to an edge rather than to absolute x/y is what keeps it on screen when
 * the panel expands, collapses, or the window resizes.
 */
export type Dock = {
  x: number;
  y: number;
  edgeX: "left" | "right";
  edgeY: "top" | "bottom";
};

/** What Matchup remembers about one tab, and deliberately nothing beyond it. */
export type TabState = {
  /** Matchup is showing on this page at all. Toggled from the toolbar icon. */
  open: boolean;
  dock?: Dock;
  /**
   * A side panel was showing this tab when the page last ran. Remembered only so a
   * refresh can start out of the way: learning it from the background takes a round
   * trip, and the page would flash its own panel in the meantime.
   */
  remote?: boolean;
};

/**
 * The page's own sessionStorage rather than extension storage, deliberately.
 * Both of these describe the page you are comparing, not the browser: turning
 * Matchup on in one tab must not turn it on in every other, and a position
 * dragged here should not follow you elsewhere. sessionStorage scopes exactly
 * that way — it survives a reload of this tab and dies with it.
 */
const KEY = "matchup:tab";

const TAB_DEFAULTS: TabState = { open: false };

const parseDock = (value: unknown): Dock | undefined => {
  if (typeof value !== "object" || value === null) return undefined;
  const { x, y, edgeX, edgeY } = value as Record<string, unknown>;
  if (typeof x !== "number" || typeof y !== "number") return undefined;
  if (edgeX !== "left" && edgeX !== "right") return undefined;
  if (edgeY !== "top" && edgeY !== "bottom") return undefined;
  return { x, y, edgeX, edgeY };
};

export const readTab = (): TabState => {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return TAB_DEFAULTS;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return TAB_DEFAULTS;
    const { open, dock, remote } = parsed as Record<string, unknown>;
    return {
      open: open === true,
      dock: parseDock(dock),
      remote: remote === true,
    };
  } catch {
    // A sandboxed frame or blocked site data denies sessionStorage outright.
    // Forgetting is better than failing to mount.
    return TAB_DEFAULTS;
  }
};

/** Merged rather than replaced, so a drag cannot clobber the open flag. */
export const patchTab = (next: Partial<TabState>) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...readTab(), ...next }));
  } catch {
    // As above — Matchup still works, it just won't remember across a reload.
  }
};

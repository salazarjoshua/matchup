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
};

/**
 * The page's own sessionStorage rather than extension storage, deliberately.
 * Both of these describe the page you are comparing, not the browser: turning
 * Matchup on in one tab must not turn it on in every other, and a position
 * dragged here should not follow you elsewhere. sessionStorage scopes exactly
 * that way — it survives a reload of this tab and dies with it.
 */
const KEY = "matchup:tab";

export const TAB_DEFAULTS: TabState = { open: false };

const isOneOf = <T extends string>(
  value: unknown,
  ...allowed: T[]
): value is T => allowed.includes(value as T);

const parseDock = (value: unknown): Dock | undefined => {
  if (typeof value !== "object" || value === null) return undefined;
  const { x, y, edgeX, edgeY } = value as Record<string, unknown>;
  if (typeof x !== "number" || typeof y !== "number") return undefined;
  if (!isOneOf(edgeX, "left", "right")) return undefined;
  if (!isOneOf(edgeY, "top", "bottom")) return undefined;
  return { x, y, edgeX, edgeY };
};

export const readTab = (): TabState => {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return TAB_DEFAULTS;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return TAB_DEFAULTS;
    const { open, dock } = parsed as Record<string, unknown>;
    return { open: open === true, dock: parseDock(dock) };
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

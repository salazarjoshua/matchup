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

/**
 * The page's sessionStorage rather than extension storage, deliberately: a
 * dragged position should survive a reload of the tab you dragged it in, and
 * nothing more. A new tab has no entry, so it opens at the corner chosen in
 * settings instead of wherever the panel was last dragged in some other tab.
 */
const KEY = "matchup:dock";

const isOneOf = <T extends string>(
  value: unknown,
  ...allowed: T[]
): value is T => allowed.includes(value as T);

export const readDock = (): Dock | undefined => {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return undefined;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return undefined;
    const { x, y, edgeX, edgeY } = parsed as Record<string, unknown>;
    if (typeof x !== "number" || typeof y !== "number") return undefined;
    if (!isOneOf(edgeX, "left", "right")) return undefined;
    if (!isOneOf(edgeY, "top", "bottom")) return undefined;
    return { x, y, edgeX, edgeY };
  } catch {
    // A sandboxed frame or blocked site data denies sessionStorage outright.
    // Losing a dragged position is better than failing to mount.
    return undefined;
  }
};

export const writeDock = (dock: Dock) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(dock));
  } catch {
    // As above — the panel still drags, it just won't remember across a reload.
  }
};

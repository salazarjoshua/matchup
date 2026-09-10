export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/** Opacity is stored as a whole 0–100 percentage everywhere it is edited. */
export const clampPercent = (value: number) => clamp(Math.round(value), 0, 100);

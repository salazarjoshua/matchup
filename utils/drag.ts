import type { DragEvent } from "react";

/**
 * Whether a drag carries files from outside the browser rather than a layer being
 * reordered inside the panel. `dataTransfer.files` is empty until the drop, so the
 * advertised types are the only thing to read during a dragover.
 */
export const hasFiles = (event: DragEvent<Element>) =>
  event.dataTransfer.types.includes("Files");

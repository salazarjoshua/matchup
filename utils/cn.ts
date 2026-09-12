import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import type { ClassValue } from "clsx";

// tailwind-merge reads `text-micro` as a text colour and drops it when a colour is
// merged alongside. Registering it as a font size keeps both.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: { "font-size": [{ text: ["micro"] }] },
  },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

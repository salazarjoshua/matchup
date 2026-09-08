import { clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';
import type { ClassValue } from 'clsx';

// tailwind-merge reads the design system's named font sizes as text colours and drops
// them when a colour is merged alongside. Registering them keeps both.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['panel-title', 'tile-label', 'helper', 'value', 'meta', 'micro'] }],
    },
  },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

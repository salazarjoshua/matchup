import { browser } from "wxt/browser";

/**
 * Namespaced rather than plain "Inter": the content script has to register the
 * face on the *host page's* document, and a page that asks for Inter itself
 * should keep getting its own copy rather than ours.
 */
export const INTER_FAMILY = "Matchup Inter";

/**
 * The two Google-Fonts subsets of Inter's variable face, self-hosted so the panel
 * needs no network and no font-src CSP allowance on the page it is injected into.
 * Split by unicode-range so the 85KB extended subset only downloads for a layer
 * name that actually contains an accented character.
 */
const SUBSETS = [
  {
    file: "/fonts/inter-latin.woff2",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    file: "/fonts/inter-latin-ext.woff2",
    unicodeRange:
      "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
  },
] as const;

let registered = false;

/**
 * Chrome ignores `@font-face` declared inside a shadow root — faces only resolve
 * against the document's font set — so a stylesheet alone can never give the
 * panel Inter. Registering from JS is what makes `--font-sans` more than a wish.
 */
export const loadInterFont = () => {
  if (registered || typeof FontFace === "undefined") return;
  registered = true;
  for (const { file, unicodeRange } of SUBSETS) {
    try {
      document.fonts.add(
        // Added unloaded on purpose: the browser then fetches each subset lazily,
        // the same way it would for a `@font-face` rule.
        new FontFace(
          INTER_FAMILY,
          `url("${browser.runtime.getURL(file)}") format("woff2")`,
          {
            weight: "400 700",
            style: "normal",
            display: "swap",
            unicodeRange,
          },
        ),
      );
    } catch {
      // A page with a restrictive enough sandbox can refuse the face. The stack
      // below it is a system sans, so losing Inter is cosmetic.
    }
  }
};

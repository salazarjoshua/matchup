import { useEffect, useRef } from "react";
import type { LayerSettings } from "./matchup-state";
import type { ShortcutAction, Shortcuts } from "./matchup-settings";

/**
 * Whether the keystroke is going somewhere text is being typed — the layer rename
 * field, or any input on the host page. `composedPath` for the page's own shadow
 * roots; ours is closed, so from window its focused field only shows as the host and
 * is looked up through the root instead. A focused panel button shows up the same way,
 * which is why the root is asked rather than the host taken as the answer.
 */
const isEditable = (event: Event, ours?: Node) => {
  let target = event.composedPath()[0];
  if (ours instanceof ShadowRoot && target === ours.host)
    target = ours.activeElement ?? target;
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
};

type Options = {
  /** Off while there is nothing to edit, so ⌥U doesn't open a picker that goes nowhere. */
  enabled?: boolean;
  selected: LayerSettings | undefined;
  shortcuts: Shortcuts;
  patchLayer: (next: Partial<LayerSettings>) => void;
  pickFiles: () => void;
  addFiles: (files: File[]) => Promise<void>;
  /** Left out where the panel is always expanded, which turns the shortcut off there. */
  onTogglePanel?: () => void;
  /** The shadow root the panel lives in, if any. */
  root?: () => Node | undefined;
};

/**
 * The ⌥ shortcuts and ⌘V image paste, for whichever window the panel is in — the page
 * or the side panel — so a fix to one can't miss the other.
 */
export const useShortcuts = (options: Options) => {
  // Read through a ref, so a rebind or a new selection takes effect without
  // re-subscribing the listeners.
  const latest = useRef(options);
  latest.current = options;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const {
        enabled = true,
        selected,
        shortcuts,
        root,
        patchLayer,
        pickFiles,
        onTogglePanel,
      } = latest.current;
      if (!enabled || !event.altKey || event.metaKey || event.ctrlKey) return;
      if (isEditable(event, root?.())) return;
      const action = (Object.keys(shortcuts) as ShortcutAction[]).find(
        (candidate) => shortcuts[candidate] === event.code,
      );
      switch (action) {
        case "toggleVisible":
          patchLayer({ visible: !selected?.visible });
          break;
        case "toggleLocked":
          patchLayer({ locked: !selected?.locked });
          break;
        case "toggleInvert":
          patchLayer({ invert: !selected?.invert });
          break;
        case "togglePanel":
          if (!onTogglePanel) return;
          onTogglePanel();
          break;
        case "upload":
          // A keydown carries user activation, which is what the file dialog
          // needs; preventDefault below doesn't spend it.
          pickFiles();
          break;
        default:
          return;
      }
      event.preventDefault();
    };
    const onPaste = (event: ClipboardEvent) => {
      const { enabled = true, root, addFiles } = latest.current;
      // A paste into the page's own field is the page's, image or not.
      if (!enabled || isEditable(event, root?.())) return;
      const files = Array.from(event.clipboardData?.files ?? []);
      if (files.length > 0) {
        event.preventDefault();
        void addFiles(files);
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("paste", onPaste, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("paste", onPaste, true);
    };
  }, []);
};

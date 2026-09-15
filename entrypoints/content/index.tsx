import MatchupApp from "./MatchupApp";
import { loadInterFont } from "@/utils/matchup-font";
import { patchTab, readTab } from "@/utils/matchup-tab";
import { PAGE_STATE } from "@/utils/side-panel";
import ReactDOM from "react-dom/client";
import { browser } from "wxt/browser";
import { createShadowRootUi } from "wxt/utils/content-script-ui/shadow-root";
import { defineContentScript } from "wxt/utils/define-content-script";
import "@/assets/tailwind.css";

export default defineContentScript({
  matches: ["<all_urls>"],
  // Keeps the panel's styles out of the host page, and the host page's out of ours.
  cssInjectionMode: "ui",

  async main(ctx) {
    const createUi = () =>
      createShadowRootUi(ctx, {
        name: "matchup-panel",
        position: "inline",
        anchor: "body",
        onMount: (container) => {
          const root = ReactDOM.createRoot(container);
          root.render(<MatchupApp />);
          return root;
        },
        onRemove: (root) => root?.unmount(),
      });

    /**
     * Built on the first open rather than on load, and torn down again on close. This
     * script runs on every page you visit, and a page Matchup has never been opened on
     * should look untouched in the inspector — the host element and the panel's
     * stylesheet are the two things that would otherwise sit in a document the whole
     * point of this is to compare against. Held as the promise, not the UI, so two
     * toggles landing together can't each build one.
     */
    let ui: ReturnType<typeof createUi> | undefined;
    let open = readTab().open;

    const show = async () => {
      // Has to happen against the page document: a face declared inside the shadow
      // root would be ignored, leaving the panel on a system fallback.
      loadInterFont();
      const built = await (ui ??= createUi());
      // The toggle can flip back while the stylesheet is still loading.
      if (open && !built.mounted) built.mount();
    };

    const hide = () => {
      void ui?.then((built) => built.remove());
      // The panel announces itself as it mounts; with it gone, nothing else would, and
      // a side panel open on this tab would go on offering to edit layers it can't draw.
      void browser.runtime
        .sendMessage({ type: PAGE_STATE, open: false })
        .catch(() => undefined);
    };

    /**
     * Out here rather than in the panel, which is the point of the split: the toolbar
     * icon and the side panel's own prompt both have to reach a page that has Matchup
     * turned off, and there is no React mounted there to hear them.
     */
    browser.runtime.onMessage.addListener((message: unknown) => {
      const request = message as { type?: string; open?: boolean };
      if (request?.type !== "matchup:toggle") return;
      // An explicit value when the side panel asks, so it can't blindly flip Matchup
      // back off if its view of the page is a moment stale.
      open = typeof request.open === "boolean" ? request.open : !open;
      // Written only for a deliberate toggle, so merely visiting a page still leaves
      // nothing behind in its sessionStorage.
      patchTab({ open });
      if (open) void show();
      else hide();
    });

    if (open) void show();
  },
});

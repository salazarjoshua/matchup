import MatchupApp from "./MatchupApp";
import { loadInterFont } from "@/utils/matchup-font";
import ReactDOM from "react-dom/client";
import { createShadowRootUi } from "wxt/utils/content-script-ui/shadow-root";
import { defineContentScript } from "wxt/utils/define-content-script";
import "@/assets/tailwind.css";

export default defineContentScript({
  matches: ["<all_urls>"],
  // Keeps the panel's styles out of the host page, and the host page's out of ours.
  cssInjectionMode: "ui",

  async main(ctx) {
    // Has to happen against the page document: a face declared inside the shadow
    // root would be ignored, leaving the panel on a system fallback.
    loadInterFont();

    const ui = await createShadowRootUi(ctx, {
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

    ui.mount();
  },
});

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  zip: { artifactTemplate: "matchup.zip" },
  manifest: {
    name: "Matchup",
    // Declared with no popup so the icon fires action.onClicked instead.
    action: { default_title: "Matchup" },
    // A plain page entrypoint, also registered as the options UI so the browser's
    // own "Options" menu and runtime.openOptionsPage() both land on it.
    options_ui: { page: "settings.html", open_in_tab: true },
    description: "Overlay any image on any page. See how they match up.",
    permissions: ["storage", "unlimitedStorage", "clipboardRead", "sidePanel"],
    // The panel's font is fetched by the content script from the page's own
    // context, so the page has to be allowed to read it.
    web_accessible_resources: [
      { resources: ["/fonts/*"], matches: ["<all_urls>"] },
    ],
    host_permissions: ["<all_urls>"],
  },
});

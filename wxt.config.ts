import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'Matchup',
    // Declared with no popup so the icon fires action.onClicked instead.
    action: { default_title: 'Matchup' },
    // A plain page entrypoint, also registered as the options UI so the browser's
    // own "Options" menu and runtime.openOptionsPage() both land on it.
    options_ui: { page: 'settings.html', open_in_tab: true },
    description: 'Pixel-perfect image overlay for comparing designs against live pages.',
    permissions: ['storage', 'unlimitedStorage', 'clipboardRead'],
    host_permissions: ['<all_urls>'],
  },
});

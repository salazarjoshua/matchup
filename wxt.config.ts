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
    description: 'Pixel-perfect image overlay for comparing designs against live pages.',
    permissions: ['storage', 'unlimitedStorage'],
    host_permissions: ['<all_urls>'],
  },
});

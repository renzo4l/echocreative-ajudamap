import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Disable file watching and WebSocket HMR during agent edits.
      ws: process.env.DISABLE_HMR === 'true' ? false as const : undefined,
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

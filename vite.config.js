import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
  build: {
    rollupOptions: {
      // ✅ Prevent wrangler config from being copied to dist
      external: [],
    },
    copyPublicDir: false  // if wrangler.json is in /public
  }
})
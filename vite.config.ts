import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const cssInjectedByJsPlugin = require('vite-plugin-css-injected-by-js').default;

const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    cssInjectedByJsPlugin(),
  ],
  base: './',
  server: {
    proxy: {
      '/assessments': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    }
  },
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        format: 'iife',
        name: 'HandsomeApp14',
        manualChunks: undefined,
        inlineDynamicImports: true,
        entryFileNames: `assets/index-${timestamp}.js`,
        chunkFileNames: `assets/index-${timestamp}.js`,
        assetFileNames: `assets/index-${timestamp}.[ext]`
      }
    }
  }
})

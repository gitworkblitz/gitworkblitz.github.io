import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Target modern browsers for smaller output
    target: 'es2020',
    // Increase chunk warning threshold (our app intentionally splits)
    chunkSizeWarningLimit: 600,
    // Use default esbuild minifier (no extra deps needed)
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React — cached aggressively, rarely changes
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Firebase — large, changes only on SDK updates
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          // UI libraries — animation + headless UI
          ui: ['framer-motion', '@headlessui/react'],
          // Charts — only used by admin dashboard
          charts: ['recharts'],
          // Icons — large tree, split separately
          icons: ['@heroicons/react'],
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    // Gzip compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // compress files > 1kb (was 10kb — more aggressive)
      deleteOriginFile: false
    }),
    // Brotli compression (smaller than gzip, supported by all modern browsers)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false
    })
  ],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Target modern browsers for smaller output
    target: 'es2020',
    // Increase chunk warning threshold (vendor libs are intentionally large)
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    // CSS optimization
    cssMinify: true,
    // Enable CSS code splitting for smaller initial bundles
    cssCodeSplit: true,
    // Reduce asset inline limit to prevent large base64 strings in JS
    assetsInlineLimit: 2048,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
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
          icons: ['@heroicons/react', 'lucide-react'],
          // PDF generation — only loaded on invoice pages
          pdf: ['html2pdf.js'],
          // Query client — used across the app
          query: ['@tanstack/react-query'],
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
  // Optimize dependency pre-bundling for much faster localhost performance
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom', 
      'firebase/app', 'firebase/auth', 'firebase/firestore',
      'lucide-react', '@heroicons/react/24/outline', '@heroicons/react/24/solid'
    ],
  },
})

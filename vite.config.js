import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    plugins: [react(), splitVendorChunkPlugin()],
    build: {
      sourcemap: false,
      minify: 'terser',
      chunkSizeWarningLimit: 600,
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
          pure_funcs: isProduction ? ['console.log', 'console.info', 'console.debug', 'console.warn'] : [],
          passes: 2
        },
        mangle: { safari10: true },
        format: { comments: false }
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            // React core — siempre cacheado
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react'
            }
            // Router
            if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run')) {
              return 'vendor-router'
            }
            // Supabase — cambia con auth/data, chunk separado
            if (id.includes('node_modules/@supabase')) {
              return 'vendor-supabase'
            }
            // Lucide icons — pesado, separado
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-lucide'
            }
            // FullCalendar — muy pesado (262KB), siempre separado
            if (id.includes('node_modules/@fullcalendar')) {
              return 'vendor-fullcalendar'
            }
            // Resto de node_modules
            if (id.includes('node_modules/')) {
              return 'vendor-misc'
            }
          }
        }
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js']
    }
  }
})

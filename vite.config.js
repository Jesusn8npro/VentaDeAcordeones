import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    plugins: [react()],
    build: {
      sourcemap: false,
      minify: 'terser',
      chunkSizeWarningLimit: 800,
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
            // FullCalendar — independiente y muy pesado, chunk propio
            if (id.includes('node_modules/@fullcalendar')) {
              return 'vendor-fullcalendar'
            }
            // Todo lo demás de node_modules va junto — evita dependencias
            // circulares entre React y librerías que usan forwardRef/createContext
            if (id.includes('node_modules/')) {
              return 'vendor'
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

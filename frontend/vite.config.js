import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      compression({
        algorithm: 'gzip',
        ext: '.gz'
      })
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            charts: ['recharts', 'chart.js', 'react-chartjs-2'],
            utils: ['axios', 'date-fns', 'jspdf', 'xlsx']
          }
        }
      },
      target: 'es2020',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production'
        }
      }
    },
    server: {
      port: 5173,
      open: true,
      hmr: {
        overlay: true
      }
    }
  }
})
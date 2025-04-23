import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment based on mode
  const isProd = mode === 'production'
  
  console.log(`Building with environment mode: ${mode}`)
  
  return {
    plugins: [
      tailwindcss(),
      react()
    ],
    define: isProd ? {
      // Force environment variables for production only
      'import.meta.env.VITE_API_URL': JSON.stringify('/api'),
      'import.meta.env.VITE_SOCKET_URL': JSON.stringify('/'),
      'import.meta.env.VITE_BASE_URL': JSON.stringify('')
    } : {},
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      minify: true,
      sourcemap: false,
      assetsDir: 'assets',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]'
        }
      }
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        // Proxy API requests to the backend server
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
          secure: false
        },
        // Proxy socket.io requests
        '/socket.io': {
          target: 'http://localhost:5001',
          changeOrigin: true,
          ws: true
        },
        // Proxy execute endpoint
        '/execute': {
          target: 'http://localhost:5001',
          changeOrigin: true
        }
      }
    }
  }
})

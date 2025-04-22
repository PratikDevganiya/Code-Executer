import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  build: {
    // Ensure output directory is correctly set
    outDir: 'dist',
    // Generate source maps for better debugging
    sourcemap: process.env.NODE_ENV === 'development',
    // Ensure index.html is generated
    emptyOutDir: true,
  },
})

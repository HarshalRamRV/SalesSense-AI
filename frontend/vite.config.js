import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',  // Output directory for production build
  },
  server: {
    port: 3000,      // Local dev server port (optional)
  },
  define: {
    'process.env': {}
  }
})

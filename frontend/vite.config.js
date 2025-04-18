import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        external: ['mongoose', 'express', 'mongodb', 'cors', 'dotenv', '/backend/', '../backend/']
      }
    },
    // Explicitly tell Vite not to process files in the backend directory
    optimizeDeps: {
      exclude: ['backend']
    }
})

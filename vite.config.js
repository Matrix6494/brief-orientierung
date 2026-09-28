import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Relative paths so assets load on GitHub Pages (username.github.io/repo-name/)
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})

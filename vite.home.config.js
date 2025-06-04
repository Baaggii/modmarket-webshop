import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

module.exports = defineConfig({
  base: '/',
  plugins: [react()],
  root: 'src/homepage',
  publicDir: '.', // Үндсэн директороос .htaccess зэргийг татах тохиргоо
  build: {
    outDir: '../../../../public_html',
    emptyOutDir: false
  }
})

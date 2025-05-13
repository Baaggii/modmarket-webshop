import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/carpenters/',
  plugins: [react()],
  root: 'src/carpenters/src/client',
  build: {
    outDir: '../../../../../../public_html/carpenters',
    emptyOutDir: true,
    target: 'esnext',
    manifest: true,
    minify: false,
    sourcemap: false,
    brotliSize: false
  }
})
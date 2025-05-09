const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')

module.exports = defineConfig({
  base: '/carpenters/',
  plugins: [react()],
  root: 'src/carpenters/src/client',
  build: {
    outDir: '../../../../../public_html/carpenters',
    emptyOutDir: true
  }
})
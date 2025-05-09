const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')

module.exports = defineConfig({
  base: '/',
  plugins: [react()],
  root: 'src/homepage',
  build: {
    outDir: '../../../../public_html',
    emptyOutDir: false
  }
})

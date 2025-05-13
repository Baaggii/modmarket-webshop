const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')

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

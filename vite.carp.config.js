import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/carpenters/',
  plugins: [react()],
  root: 'src/carpenters',
  build: {
    outDir: '../../../public_html/carpenters',
    emptyOutDir: true
  }
})

---

## 📄 src/client/main.jsx (HashRouter)
```js
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import CarpenterPage from './pages/CarpenterPage'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path=":username" element={<CarpenterPage />} />
        <Route path=":username/products" element={<ProductList />} />
        <Route path=":username/product:productId" element={<ProductDetail />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
)
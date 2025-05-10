import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CarpenterPage from './pages/CarpenterPage'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path=":username" element={<CarpenterPage />} />
        <Route path=":username/products" element={<ProductList />} />
        <Route path=":username/product/:productId" element={<ProductDetail />} />
      </Routes>
    </Router>
  )
}
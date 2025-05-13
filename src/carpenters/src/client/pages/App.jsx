import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom'

import Login from './Login'
import Register from './Register'
import Dashboard from './Dashboard'
import CarpenterPage from './CarpenterPage'
import ProductList from './ProductList'
import ProductDetail from './ProductDetail'

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
import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    axios.get('/api/carpenter/me')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))

    if (user?.username) {
      axios.get(`/api/carpenter/${user.username}/products`)
        .then(res => setProducts(res.data))
    }
  }, [user?.username])

  const handleLogout = () => {
    axios.post('/api/carpenter/logout')
      .then(() => window.location.href = '/carpenters/#/login')
  }

  return (
    <div className="p-6">
      {user && (
        <div className="mb-6">
          <div className="text-xl font-bold">👤 {user.full_name}</div>
          <div className="text-gray-600 text-sm">📧 {user.email}</div>
          <div className="text-gray-600 text-sm">📱 {user.phone}</div>
          <div className="text-gray-600 text-sm italic">📝 {user.bio}</div>
          <button onClick={handleLogout} className="mt-4 text-sm text-blue-600 underline">Logout</button>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">📊 My Products</h2>
      <ul className="space-y-3">
        {products.map(p => (
          <li key={p.id} className="border p-3 rounded">
            <div className="font-bold">{p.name}</div>
            <div className="text-sm text-gray-600">{p.description}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
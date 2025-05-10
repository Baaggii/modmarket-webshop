import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    axios.get('/api/carpenter/me')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))

    axios.get(`/api/carpenter/ganbaatar/products`)
      .then(res => setProducts(res.data))
  }, [])

  const handleLogout = () => {
    axios.post('/api/carpenter/logout')
      .then(() => window.location.href = '/carpenters/#/login')
  }

  return (
    <div className="p-6">
      {user && (
        <div className="mb-6">
          <div className="text-xl font-bold">👤 {user.email}</div>
          <button onClick={handleLogout} className="mt-2 text-sm text-blue-600 underline">Logout</button>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">📊 My Dashboard</h2>
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
```
```jsx
import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const username = 'ganbaatar' // ⚠️ should come from session later

  useEffect(() => {
    axios.get(`/api/carpenter/${username}/products`)
      .then(res => setProducts(res.data))
  }, [])

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📊 My Dashboard</h2>
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
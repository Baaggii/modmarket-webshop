import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

export default function ProductList() {
  const { username } = useParams()
  const [products, setProducts] = useState([])

  useEffect(() => {
    axios.get(`/api/carpenter/${username}/products`)
      .then(res => setProducts(res.data))
      .catch(err => console.error(err))
  }, [username])

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">🪚 {username}'s Products</h1>
      <ul className="space-y-2">
        {products.map(p => (
          <li key={p.id} className="border p-2 rounded">
            <div className="font-semibold">{p.name}</div>
            <div className="text-sm text-gray-500">{p.description}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}

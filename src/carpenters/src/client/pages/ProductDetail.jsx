import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

export default function ProductDetail() {
  const { username, productId } = useParams()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    axios.get(`/api/carpenter/${username}/product/${productId}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err))
  }, [username, productId])

  if (!product) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🪑 {product.name}</h1>
      <img src={product.image_url} alt={product.name} className="rounded mb-4" />
      <p className="text-gray-700">{product.description}</p>
      <p className="text-green-600 font-bold mt-4">Price: ${product.price}</p>
    </div>
  )
}
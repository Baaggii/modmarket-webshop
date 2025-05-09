import React from 'react'
import { useParams } from 'react-router-dom'

export default function CarpenterPage() {
  const { username } = useParams()

  return (
    <div className="p-6 text-xl font-bold text-blue-700">
      🪵 Carpenter: {username}
    </div>
  )
}

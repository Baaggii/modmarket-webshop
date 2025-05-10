import React, { useState } from 'react'
import axios from 'axios'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('/api/carpenter/login', { email, password })
      alert('✅ Login success')
      // TODO: Save token, redirect
    } catch (err) {
      alert('❌ Login failed')
    }
  }

  return (
    <form onSubmit={handleLogin} className="p-6 max-w-sm mx-auto space-y-4">
      <h2 className="text-xl font-bold">🔑 Login</h2>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="border p-2 w-full" placeholder="Email" required />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="border p-2 w-full" placeholder="Password" required />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
    </form>
  )
}
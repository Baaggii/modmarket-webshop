import React, { useState } from 'react'
import axios from 'axios'

export default function Register() {
  const [form, setForm] = useState({
    username: '', full_name: '', phone: '', email: '', password: '', bio: ''
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/carpenter/register', form)
      alert('✅ Registered')
    } catch (err) {
      alert('❌ Failed')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-lg mx-auto space-y-4">
      <h2 className="text-xl font-bold">🪵 Register as Carpenter</h2>
      {['username','full_name','phone','email','password','bio'].map(name => (
        <input key={name} name={name} value={form[name]} onChange={handleChange} className="border p-2 w-full" placeholder={name} required />
      ))}
      <button className="bg-green-600 text-white px-4 py-2 rounded">Register</button>
    </form>
  )
}
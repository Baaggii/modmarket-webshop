import express from 'express'
const router = express.Router()
import db from '../lib/db.js'

// GET all products for a carpenter
router.get('/:username/products', async (req, res) => {
  const { username } = req.params
  try {
    const [products] = await db.execute(
      'SELECT id, name, description FROM products WHERE carpenter = ?',
      [username]
    )
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: 'DB error', detail: err.message })
  }
})

// GET single product detail
router.get('/:username/product/:productId', async (req, res) => {
  const { username, productId } = req.params
  try {
    const [rows] = await db.execute(
      'SELECT * FROM products WHERE id = ? AND carpenter = ?',
      [productId, username]
    )
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'DB error', detail: err.message })
  }
})

// POST register a new carpenter
router.post('/register', async (req, res) => {
  const { username, full_name, phone, email, bio } = req.body
  try {
    await db.execute(
      'INSERT INTO carpenters (username, full_name, phone, email, bio) VALUES (?, ?, ?, ?, ?)',
      [username, full_name, phone, email, bio]
    )
    res.json({ status: 'ok', message: 'Carpenter registered' })
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', detail: err.message })
  }
})

export default router
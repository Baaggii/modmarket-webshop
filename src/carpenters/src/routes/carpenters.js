import express from 'express'
const router = express.Router()
import db from '../lib/db.js'
import multer from 'multer'
import path from 'path'

// GET all products for a carpenter
router.get('/:username/products', async (req, res) => {
  const { username } = req.params
  try {
    const [products] = await db.execute(
      'SELECT id, name, description FROM carp_products WHERE carpenter = ?',
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
      'SELECT * FROM carp_products WHERE id = ? AND carpenter = ?',
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
      'INSERT INTO carp_accounts (username, full_name, phone, email, bio) VALUES (?, ?, ?, ?, ?)',
      [username, full_name, phone, email, bio]
    )
    res.json({ status: 'ok', message: 'Carpenter registered' })
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', detail: err.message })
  }
})


const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const filename = Date.now() + ext
    cb(null, filename)
  }
})

const upload = multer({ storage })

// POST upload image for product
router.post('/:username/upload', upload.single('image'), (req, res) => {
  const url = `/uploads/${req.file.filename}`
  res.json({ image_url: url })
})

export default router
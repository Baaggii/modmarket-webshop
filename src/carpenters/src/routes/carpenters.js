const express = require('express')
const router = express.Router()
import bcrypt from 'bcrypt';
const db = require('../lib/db.js') // CommonJS-ээр холбох

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

router.post('/register', async (req, res) => {
  const { username, full_name, phone, email, bio, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      'INSERT INTO carp_accounts (username, full_name, phone, email, bio, password) VALUES (?, ?, ?, ?, ?, ?)',
      [username, full_name, phone, email, bio, hashedPassword]
    );
    res.json({ status: 'ok', message: 'Carpenter registered' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', detail: err.message });
  }
});

console.log('Request body:', req.body);
console.log('Error:', err.message);


// module.exports ашиглана
module.exports = router
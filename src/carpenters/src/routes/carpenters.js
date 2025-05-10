import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret'

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const [rows] = await db.execute(
      'SELECT * FROM carpenters WHERE email = ?',
      [email]
    )
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' })

    const user = rows[0]
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    res.cookie('token', token, { httpOnly: true }).json({ token })
  } catch (err) {
    res.status(500).json({ error: 'Login failed', detail: err.message })
  }
})

router.get('/me', (req, res) => {
  const token = req.cookies.token
  if (!token) return res.status(401).json({ error: 'No token' })
  try {
    const user = jwt.verify(token, JWT_SECRET)
    res.json(user)
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

router.post('/logout', (req, res) => {
  res.clearCookie('token').json({ success: true })
})
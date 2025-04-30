const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

dotenv.config();

process.on('uncaughtException', (err) => console.error('❌ Uncaught Exception:', err));
process.on('unhandledRejection', (reason) => console.error('❌ Unhandled Rejection:', reason));

const app = express();
const PORT = process.env.API_PORT || 3001;

const allowedOrigins = ['https://modmarket.mn'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('CORS policy violation'));
  }
}));

app.use(express.json());

const buildPath = path.join(__dirname, 'build');
app.use('/erp', express.static(buildPath));
app.get('/erp/*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

const erpPool = mysql.createPool({
  host: process.env.ERP_DB_HOST,
  user: process.env.ERP_DB_USER,
  password: process.env.ERP_DB_PASSWORD,
  database: process.env.ERP_DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

app.use('/api', (req, res, next) => next());

app.post('/api/create-admin', async (req, res) => {
  const { email, password, name, company, id } = req.body;
  try {
    const [check] = await erpPool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (check.length) return res.status(409).json({ message: `⚠️ ${email} бүртгэгдсэн байна.` });

    const hashed = await bcrypt.hash(password, 10);
    await erpPool.execute(
      'INSERT INTO users (email, id, password, name, company, role) VALUES (?, ?, ?, ?, ?, ?)',
      [email, id || null, hashed, name, company || 'ModMarket ХХК', 'admin']
    );
    res.json({ message: '✅ Админ хэрэглэгч амжилттай үүслээ' });
  } catch (err) {
    console.error('❌ DB error:', err);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Амжилттай гарлаа' });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await erpPool.execute(
      'SELECT * FROM users WHERE email = ? OR id = ?',
      [email, email]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Хэрэглэгч олдсонгүй' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Нууц үг буруу байна' });

    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

app.get('/', (req, res) => res.send('✅ Login API ажиллаж байна'));

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Login API: http://localhost:${PORT}`);
});

server.on('error', (error) => console.error('❌ Server error:', error));
process.on('SIGTERM', () => {
  console.log('🔌 SIGTERM signal received. Closing server.');
  server.close(() => process.exit(0));
});

require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    const [rows] = await connection.query('SELECT NOW() AS time');
    console.log('✅ Database connected successfully! Current time:', rows[0].time);
    await connection.end();
  } catch (err) {
    console.error('❌ Error connecting to the database:', err.message);
  }
}

testConnection();

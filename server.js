const express = require('express')
const cors = require('cors')
const fs = require('fs/promises')
const mysql = require('mysql2/promise')
const dotenv = require('dotenv')
dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'erp',
  waitForConnections: true,
  connectionLimit: 10
})

app.get('/api/health', (req,res)=>res.json({status:'ok'}))

app.get('/api/products', async (_req, res) => {
  try {
    const data = await fs.readFile('./data/products.json', 'utf8')
    res.json(JSON.parse(data))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/products/recommended', async (_req, res) => {
  try {
    const data = await fs.readFile('./data/products.json', 'utf8')
    const products = JSON.parse(data).slice(0, 3)
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/:table', async (req,res)=>{
  const {table} = req.params
  const data = req.body
  try{
    const [result] = await pool.query(`INSERT INTO ?? SET ?`, [table, data])
    res.json({id: result.insertId})
  }catch(err){
    res.status(500).json({error: err.message})
  }
})

const port = process.env.PORT || 3001
app.listen(port, ()=>console.log(`ERP backend running on ${port}`))

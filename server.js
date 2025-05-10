const express = require('express')
const cors = require('cors')
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
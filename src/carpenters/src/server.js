const express = require('express')
const cors = require('cors')
const mysql = require('mysql2/promise')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
dotenv.config()

const carpentersRouter = require('./src/routes/carpenters.js')

const app = express()
app.use(cors())
app.use(express.json())
app.use(cookieParser())

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'erp',
  waitForConnections: true,
  connectionLimit: 10
})

app.get('/api/health', (req,res)=>res.json({status:'ok'}))

app.use('/api/carpenter', carpentersRouter)

const port = process.env.PORT || 3001
app.listen(port, ()=>console.log(`ERP backend running on ${port}`))
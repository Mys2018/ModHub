require("dotenv").config()
const express = require("express")
const cors = require("cors")

const authRoutes = require("./auth/auth.routes");
const modsRoutes = require('./mods/mods.routes')

const app = express()
app.use(cors())
app.use(express.json())

app.get("/api/health", (req, res) => {
  res.json({status: 'CoreAPI запущен'})
})

app.use('/api/auth', authRoutes)
app.use('/api/mods', modsRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`)
})

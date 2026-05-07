const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

pool.connect().then(() => {
  console.log("Подключение к БД создано")
}).catch((error) => {
  console.error("Ошибка подключения к БД", error)
})

module.exports = pool;
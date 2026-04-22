const express = require('express')
const bcrypt = require('bcryptjs');
const pool = require('../db')

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password} = req.body

    if (!username || !email || !password) {
      return res.status(400).json({error: 'Не все обязательные поля заполнены'})
    }

    const userExists = await pool.query(
        'SELECT * FROM users WHERE username = $1 OR email = $2',
        [username, email]
    )

    if (userExists.rows.length > 0) {
      return res.status(400).json({error: "Пользователь с таким ником или почтой уже существуют"})
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUserId = crypto.randomUUID();

    const result = await pool.query(
        'INSERT INTO users (id, username, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, username, email',
        [newUserId, username, email, hashedPassword]
    )

    console.log(result)
    const newUser = result.rows[0]

    res.status(201).json({
      message: 'Пользователь создан',
      user: newUser
    })

  } catch (e) {
    console.error(e)
    res.status(500).json({error: 'Ошибка сервера'})
  }
})

router.post('/login', (req, res) => {
  res.json({message: "Заглушка для логина"})
})

module.exports = router
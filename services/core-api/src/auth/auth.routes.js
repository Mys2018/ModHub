const express = require('express')
const bcrypt = require('bcryptjs');
const pool = require('../db')
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

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

router.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body
    if (!email || !password) {
      return res.status(400).json({error: "Не введен логи или пароль"})
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])

    if (result.rows.length === 0) {
      return res.status(401).json({error: "Неверные данные"})
    }

    const user = result.rows[0]

    const isMatch = await bcrypt.compare(password, user.password_hash)

    if (!isMatch) {
      return res.status(401).json({error: "Неверные данные"})
    }

    const token = jwt.sign(
        {id: user.id, username: user.username},
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    )

    res.status(200).json({
      message: "Успешный вход",
      token: token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      }
    })

  } catch (e) {
    console.error("Ошибка при входе", e)
    res.status(500).json({message: "Ошибка сервера"})
  }
})

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
        'SELECT id, email, username FROM users WHERE id = $1',
        [req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({
      message: 'Доступ разрешен!',
      user: result.rows[0]
    });
  } catch (e) {
    console.error("Ошибка при входе", e)
    res.status(500).json({message: "Ошибка сервера"})
  }
})

module.exports = router
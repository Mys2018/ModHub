const express = require('express')
const crypto = require('crypto')
const pool = require('../db')
const authMiddleware = require('../middleware/auth.middleware')

const router = express.Router()

//
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, version } = req.body

    if (!title) {
      return res.status(400).json({message: "Название мода обязательно"})
    }

    const newModId = crypto.randomUUID()

    const authorId = req.body.id

    const result = await pool.query(
        'INSERT INTO mods (id, title, description, version, author_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [newModId, title, description, version, authorId]
    )

    res.status(201).json({
      message: "Мод успешно добавлен в каталог",
      mod: result.rows[0]
    })
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка сервера при создании мода' });
  }
})

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mods ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении списка модов' });
  }
});

module.exports = router;
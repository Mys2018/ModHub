const express = require('express')
const crypto = require('crypto')
const pool = require('../db')
const authMiddleware = require('../middleware/auth.middleware')
const upload = require('../middleware/upload.middleware')
const { uploadFile } = require('../storage/minio.client')
const path = require("node:path");
const { sendModForScan } = require('../kafka/producer')

const router = express.Router()

// ОТПРАВИТЬ МОД
router.post('/', authMiddleware, upload.single('mod_file'), async (req, res) => {
  try {
    const { title, description, version } = req.body
    const file = req.file

    console.log('BODY:', req.body);
    console.log('FILE:', req.file);

    if (!title || !file) {
      return res.status(400).json({message: "Название мода и файл обязательно"})
    }

    const newModId = crypto.randomUUID()
    const authorId = req.body.id

    const ext = path.extname(file.originalname)
    const uniqueFileName = `${newModId}${ext}`

    const fileUrl = await uploadFile(uniqueFileName, file.buffer, file.mimetype)

    const result = await pool.query(
        'INSERT INTO mods (id, title, description, version, author_id, file_url, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [newModId, title, description, version, authorId, fileUrl, 'pending']
    )

    const savedMod = result.rows[0]

    await sendModForScan(newModId, fileUrl)

    res.status(201).json({
      message: "Мод загружен и отправлен на проверку",
      mod: savedMod
    })
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка сервера при создании мода' });
  }
})

// ПОЛУЧИТЬ СПИСОК МОДОВ
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
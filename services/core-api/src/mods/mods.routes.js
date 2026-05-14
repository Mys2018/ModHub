const express = require('express')
const crypto = require('crypto')
const pool = require('../db')
const authMiddleware = require('../middleware/auth.middleware')
const upload = require('../middleware/upload.middleware')
const { uploadFile, deleteFile } = require('../storage/minio.client')
const path = require("node:path");
const { sendModForScan } = require('../kafka/producer')

const router = express.Router()

// ОТПРАВИТЬ МОД
router.post('/', authMiddleware, upload.single('mod_file'), async (req, res) => {
  try {
    const { title, description, version, targetDevice, androidVersion} = req.body
    const file = req.file

    console.log('BODY:', req.body);
    console.log('FILE:', req.file);

    if (!title || !file) {
      return res.status(400).json({message: "Название мода и файл обязательно"})
    }

    const newModId = crypto.randomUUID()
    const authorId = req.user.id

    const ext = path.extname(file.originalname)
    const uniqueFileName = `${newModId}${ext}`

    const fileUrl = await uploadFile(uniqueFileName, file.buffer, file.mimetype)

    await pool.query('BEGIN');

    const modResult = await pool.query(
        'INSERT INTO mods (id, title, description, author_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [newModId, title, description, authorId,]
    )

    const versionResult = await pool.query(
        'INSERT INTO mod_versions (id, mod_id, version_tag, target_device, android_version, file_path, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [crypto.randomUUID(), newModId, version, targetDevice, androidVersion, fileUrl, 'pending']
    );

    await pool.query('COMMIT');

    const savedMod = modResult.rows[0]

    await sendModForScan(newModId, versionResult.rows[0].id, fileUrl);

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
    const query = `
        SELECT
            m.id,
            m.title,
            m.description,
            m.created_at,
            u.username AS author_name,
            COALESCE(
                            json_agg(
                            json_build_object(
                                    'id', mv.id,
                                    'version_tag', mv.version_tag,
                                    'file_path', mv.file_path,
                                    'status', mv.status,
                                    'created_at', mv.created_at
                            ) ORDER BY mv.created_at DESC
                                    ) FILTER (WHERE mv.id IS NOT NULL), '[]'
            ) AS versions
        FROM mods m
                 LEFT JOIN users u ON m.author_id = u.id
                 LEFT JOIN mod_versions mv ON m.id = mv.mod_id
        GROUP BY
            m.id,
            m.title,
            m.description,
            m.created_at,
            u.username
        ORDER BY m.created_at DESC
    `;

    const result = await pool.query(query)

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении списка модов' });
  }
});

// ПОЛУЧИТЬ МОДЫ АВТОРИЗОВАННОГО ПОЛЬЗОВАТЕЛЯ
router.get('/me/all', authMiddleware, async (req, res) => {
  try {
    const query = `
        SELECT 
            m.id, 
            m.title, 
            m.description, 
            m.created_at,
            u.username AS author_name,
            COALESCE(
                json_agg(
                    json_build_object(
                        'version_id', mv.id,
                        'version_tag', mv.version_tag,
                        'target_device', mv.target_device,
                        'android_version', mv.android_version,
                        'status', mv.status,
                        'created_at', mv.created_at
                    ) ORDER BY mv.created_at DESC
                ) FILTER (WHERE mv.id IS NOT NULL), '[]'
            ) AS versions
        FROM mods m
        LEFT JOIN users u ON m.author_id = u.id
        LEFT JOIN mod_versions mv ON m.id = mv.mod_id
        WHERE m.author_id = $1
        GROUP BY m.id, m.title, m.description, m.created_at, u.username
        ORDER BY m.created_at DESC
    `;

    const result = await pool.query(query, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении ваших модов' });
  }
});

// ЗАГРУЗИТЬ НОВУЮ ВЕРСИЮ ДЛЯ СУЩЕСТВУЮЩЕГО МОДА
router.post('/:id/versions', authMiddleware, upload.single('mod_file'), async (req, res) => {
  try {
    const { version, targetDevice, androidVersion } = req.body;
    const modId = req.params.id;
    const file = req.file;

    if (!version || !file) {
      return res.status(400).json({ message: "Версия и файл обязательны" });
    }

    const modCheck = await pool.query('SELECT id FROM mods WHERE id = $1 AND author_id = $2', [modId, req.user.id]);
    if (modCheck.rows.length === 0) {
      return res.status(403).json({ message: "Мод не найден или у вас нет прав на его редактирование" });
    }

    const newVersionId = crypto.randomUUID();
    const ext = path.extname(file.originalname);
    const uniqueFileName = `${newVersionId}${ext}`;

    const fileUrl = await uploadFile(uniqueFileName, file.buffer, file.mimetype);

    const result = await pool.query(
        'INSERT INTO mod_versions (id, mod_id, version_tag, target_device, android_version, file_path, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [newVersionId, modId, version, targetDevice || 'Any', androidVersion || 'Any', fileUrl, 'pending']
    );

    await sendModForScan(modId, newVersionId, fileUrl);

    res.status(201).json({
      message: "Новая версия загружена и отправлена на проверку",
      version: result.rows[0]
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка сервера при добавлении версии' });
  }
});

// ПОЛУЧИТЬ ОПРЕДЕЛЕННЫЙ МОД
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
        SELECT 
            m.id, 
            m.title, 
            m.description, 
            m.created_at,
            u.username AS author_name,
            COALESCE(
                json_agg(
                    json_build_object(
                        'version_id', mv.id,
                        'version_tag', mv.version_tag,
                        'target_device', mv.target_device,
                        'android_version', mv.android_version,
                        'status', mv.status,
                        'file_path', mv.file_path,
                        'created_at', mv.created_at
                    ) ORDER BY mv.created_at DESC
                ) FILTER (WHERE mv.id IS NOT NULL), '[]'
            ) AS versions
        FROM mods m
        LEFT JOIN users u ON m.author_id = u.id
        LEFT JOIN mod_versions mv ON m.id = mv.mod_id
        WHERE m.id = $1
        GROUP BY 
            m.id, 
            m.title, 
            m.description, 
            m.created_at, 
            u.username
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Мод не найден' });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении мода' });
  }
});

// УДАЛИТЬ МОД И ЕГО ВЕРСИИ
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const modId = req.params.id;
    const userId = req.user.id;

    const modCheck = await pool.query(
        'SELECT id FROM mods WHERE id = $1 AND author_id = $2',
        [modId, userId]
    );

    if (modCheck.rows.length === 0) {
      return res.status(403).json({ message: "Мод не найден или у вас нет прав на его удаление" });
    }

    const versions = await pool.query(
        'SELECT file_path FROM mod_versions WHERE mod_id = $1',
        [modId]
    );

    await pool.query('DELETE FROM mods WHERE id = $1', [modId]);

    for (const row of versions.rows) {
      if (row.file_path) {
        const fileName = row.file_path.split('/').pop();
        await deleteFile(fileName);
      }
    }

    res.json({ message: "Мод и все связанные файлы успешно удалены" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера при удалении мода' });
  }
});

// УДАЛИТЬ ВЕРСИЮ МОДА
router.delete('/:modId/versions/:versionId', authMiddleware, async (req, res) => {
  try {
    const { modId, versionId } = req.params;
    const userId = req.user.id;

    const modCheck = await pool.query(
        'SELECT id FROM mods WHERE id = $1 AND author_id = $2',
        [modId, userId]
    );

    if (modCheck.rows.length === 0) {
      return res.status(403).json({ message: "Нет прав доступа" });
    }

    const versionCheck = await pool.query(
        'SELECT file_path FROM mod_versions WHERE id = $1 AND mod_id = $2',
        [versionId, modId]
    );

    if (versionCheck.rows.length === 0) {
      return res.status(404).json({ message: "Версия не найдена" });
    }

    const filePath = versionCheck.rows[0].file_path;

    await pool.query('DELETE FROM mod_versions WHERE id = $1', [versionId]);

    if (filePath) {
      const fileName = filePath.split('/').pop();
      await deleteFile(fileName);
    }

    res.json({ message: "Версия успешно удалена" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при удалении версии' });
  }
});

module.exports = router;
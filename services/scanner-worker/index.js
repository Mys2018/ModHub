const { Kafka } = require('kafkajs')
const { Pool } = require('pg')
const NodeClam = require('clamscan')
const axios = require('axios')
const Minio = require('minio');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

const kafka = new Kafka({
  clientId: 'core-api',
  brokers: ['kafka:9092']
})

const consumer = kafka.consumer({
  groupId: 'mod-scanners-group'
})

const minioClient = new Minio.Client({
  endPoint: 'minio',
  port: 9000,
  useSSL: false,
  accessKey: 'admin',
  secretKey: 'supersecretpassword'
});

const clamConfig = {
  removeInfected: false,
  preference: 'clamdscan',
  clamdscan: {
    host: 'clamav',
    port: 3310,
    timeout: 120000,
    localFallback: false,
    active: true
  }
}

const initClamAV = async (retries = 30) => {
  for (let i = 0; i < retries; i++) {
    try {
      const clamscan = await new NodeClam().init(clamConfig);
      console.log('[CLAMAV] Антивирусный движок ответил и готов к работе!');
      return clamscan;
    } catch (err) {
      console.log("[CLAMAV] ClamAV еще качает базы... Ждем 10 секунд (попытка " + (i + 1) + "/" + retries + ")");
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  throw new Error('[CLAMAV] ClamAV так и не запустился за отведенное время.');
};

const startWorker = async () => {
  try {
    console.log('[CLAMAV] Запуск антивируса')
    const clamscan = await initClamAV();
    console.log('[CLAMAV] Антивирус инициализирован')

    await consumer.connect()
    console.log('[CLAMAV] Антивирус подключен к кафке')

    await consumer.subscribe({
      topic: 'mod-scans',
      fromBeginning: true
    })

    await consumer.run({
      eachMessage: async ({ message }) => {
        const eventData = JSON.parse(message.value.toString())

        console.log(`Новая задача — ID файла ${eventData.modId}`)
        console.log(`Новая задача — Путь файла ${eventData.fileUrl}`)

        if (!eventData || !eventData.modId || !eventData.fileUrl) {
          console.log('[CLAMAV] Пропущено битое сообщение из Кафки')
          return;
        }

        const internalUtl = eventData.fileUrl.replace('localhost', 'minio')

        try {
          // console.log('[CLAMAV] Скачивание файла для проверки')
          // const response = await axios({
          //   method: 'get',
          //   url: internalUtl,
          //   responseType: 'stream'
          // })
          console.log('[CLAMAV] Скачивание файла из MinIO')

          const fileName = eventData.fileUrl.split('/').pop()
          const fileStream = await minioClient.getObject('mods', fileName)

          console.log('[CLAMAV] Начало сканирования')

          const scanResult = await clamscan.scanStream(fileStream)

          let newStatus

          if(scanResult.isInfected){
            console.log(`[CLAMAV] Найден(ы) вирус(ы) у ${eventData.modId}:`, scanResult.viruses.join(', '))
            newStatus = 'rejected'
          } else {
            console.log(`[CLAMAV] Вирусы не найдены у ${eventData.modId}`)
            newStatus = 'approved'
          }

          await pool.query(
              'UPDATE mods SET status = $1 WHERE id = $2',
              [newStatus, eventData.modId]
          )

          console.log(`[CLAMAV] Статус у  ${eventData.modId} изменен на ${newStatus}`)
        } catch (e) {
          console.error(`[CLAMAV] Сбой во время проверки ${eventData.modId}`, e.message)
          await pool.query(
              "UPDATE mods SET status = 'error' WHERE id = $1",
              [eventData.modId]
          )
        }
      }
    })
  } catch (e) {
    console.error(`[CLAMAV] Ошибка инициализации антивируса`, e.message)
  }
}

startWorker()

const { Kafka } = require('kafkajs')

const kafka = new Kafka({
  clientId: 'core-api',
  brokers: ['kafka:9092']
})

const producer = kafka.producer()

const admin = kafka.admin()

const connectionProducer = async () => {
  try {
    await admin.connect()

    const existingTopics = await admin.listTopics()

    if (!existingTopics.includes('mod-scans')){
      await admin.createTopics({
        topics: [{
          topic: 'mod-scans',
          numPartitions: 1
        }]
      })

      console.log('[KAFKA] Топик mod-scans создан')
    }

    await admin.disconnect()

    await producer.connect()

    console.log('[KAFKA] Кафка подключена')
  } catch (e) {
    console.error("[KAFKA] Кафка не подключена", e)
  }
}

const sendModForScan = async (modId, fileUrl) => {
  try {
    await producer.send({
      topic: 'mod-scans',
      messages: [
        {
          key: modId,
          value: JSON.stringify({event: "MOD-UPLOADED", modId, fileUrl})
        }
      ]
    })
    console.log("[KAFKA] — ", modId, ' | ', fileUrl)
    console.log('[KAFKA] Мод отправлен на сканирование')
  } catch (e) {
    console.error('[KAFKA] Ошибка при отправке мода на сканирование')
  }
}

module.exports = { connectionProducer, sendModForScan}
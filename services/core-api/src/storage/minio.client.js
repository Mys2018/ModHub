const Minio = require('minio')

const minioClient = new Minio.Client({
  endPoint: 'minio',
  port: 9000,
  useSSL: false,
  accessKey: 'admin',
  secretKey: 'supersecretpassword'
})

const BUCKET_NAME = 'mods'

const uploadFile = async (fileName, fileBuffer, mimeType) => {
  try {
    await minioClient.putObject(BUCKET_NAME, fileName, fileBuffer, {
      'Content-type': mimeType
    })

    return `http://localhost:9000/${BUCKET_NAME}/${fileName}`
  } catch (e) {
    console.error('Ошибка при загрузке в MinIO:', err);
    throw err;
  }
}

module.exports = { uploadFile }
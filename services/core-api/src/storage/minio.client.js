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

    return fileName;
  } catch (e) {
    console.error('Ошибка при загрузке в MinIO:', err);
    throw err;
  }
}

const deleteFile = async (fileName) => {
  try {
    await minioClient.removeObject(BUCKET_NAME, fileName)
    console.log(`[MINIO] Файл ${fileName} удален`)
  } catch (e) {
    console.error(`[MINIO] Ошибка при удалении файла ${fileName}:`, err);
  }
}

module.exports = { minioClient, uploadFile, deleteFile };
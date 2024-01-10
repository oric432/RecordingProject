const Minio = require("minio");
const { v4: uuidv4 } = require("uuid");

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT),
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  useSSL: false,
});

const saveRecording = async (sessionId, recordingCount, audioBuffer) => {
  const objectKey = `${sessionId}_${recordingCount}.wav`;
  const bucketName = "recording-bucket-2";

  try {
    await minioClient.putObject(bucketName, objectKey, audioBuffer);

    const stat = await minioClient.statObject(bucketName, objectKey);
    const fileSize = stat.size;

    return { success: true, name: objectKey };
  } catch (error) {
    return { success: false, name: error };
  }
};

module.exports = {
  minioClient,
  saveRecording,
};

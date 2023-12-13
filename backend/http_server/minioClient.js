const Minio = require("minio");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT),
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  useSSL: false,
});

const saveRecording = async (audioBuffer) => {
  const objectKey = `${uuidv4()}.wav`;
  const bucketName = process.env.RECORDING_BUCKET_NAME;

  try {
    await minioClient.putObject(
      bucketName,
      objectKey,
      Buffer.concat(audioBuffer)
    );

    return { success: true, name: objectKey };
  } catch (error) {
    console.log(error);
    return { success: false, msg: error };
  }
};

module.exports = {
  minioClient,
  saveRecording,
};

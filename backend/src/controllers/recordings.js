const { StatusCodes } = require("http-status-codes");
require("express-async-errors");
const { NotFoundError, BadRequestError } = require("../errors");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { minioClient } = require("../http_server");

const getAllRecordings = async (_req, res) => {
  const recordings = await prisma.recording.findMany({});

  if (!recordings) {
    throw new NotFoundError("couldn't fetch recordings");
  }

  return res
    .status(StatusCodes.OK)
    .json({ msg: "recordings fetched successfully", data: recordings });
};

const addRecording = async (req, res) => {
  const recording = await prisma.recording.create({
    data: { ...req.body },
  });

  if (!recording) {
    throw new BadRequestError("couldn't create recording");
  }

  return res
    .status(StatusCodes.OK)
    .json({ msg: "recording created successfully", data: recording });
};

const getSingleRecording = async (req, res) => {
  const { id } = req.params;
  const recording = await prisma.recording.findUnique({
    where: { id: parseInt(id) },
  });

  if (!recording) {
    throw new BadRequestError("couldn't fetch recording");
  }

  const bucketName = process.env.RECORDING_BUCKET_NAME;
  let urls = [];

  async function getPresignedUrl(index) {
    return new Promise((resolve, reject) => {
      let objectName = `${recording.name}_${index}.wav`;
      minioClient.presignedGetObject(bucketName, objectName, (err, url) => {
        if (err) {
          reject(err);
        } else {
          resolve(url);
        }
      });
    });
  }

  async function getPresignedUrls() {
    for (let index = 0; index <= recording.recordingCount; index++) {
      try {
        const url = await getPresignedUrl(index);
        urls.push(url);
      } catch (error) {
        console.error(`Error getting presigned URL for index ${index}:`, error);
        // Handle the error as needed, e.g., throw an exception or continue with the next iteration
      }
    }
  }

  // Call the asynchronous function and wait for it to complete
  await getPresignedUrls();

  return res.status(StatusCodes.OK).json(urls);
};

module.exports = {
  getAllRecordings,
  addRecording,
  getSingleRecording,
};

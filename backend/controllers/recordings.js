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

  minioClient.presignedGetObject(
    bucketName,
    recording.filePath,
    parseInt(process.env.MINIO_PRE_URL_EXP),
    (err, presignedUrl) => {
      if (err) {
        throw new BadRequestError("could not create a presigned URL");
      }

      if (!presignedUrl) {
        throw new NotFoundError(
          "could not find object in the specified bucket"
        );
      }

      return res.status(StatusCodes.OK).json({
        msg: "created presigned url",
        data: { ...recording, presignedUrl },
      });
    }
  );
};

module.exports = {
  getAllRecordings,
  addRecording,
  getSingleRecording,
};

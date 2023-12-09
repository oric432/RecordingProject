const { StatusCodes } = require("http-status-codes");
require("express-async-errors");
const { NotFoundError, BadRequestError } = require("../errors");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllRecordings = async (req, res) => {
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

module.exports = { getAllRecordings, addRecording };

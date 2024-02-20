const { StatusCodes } = require("http-status-codes");
require("express-async-errors");
const { BadRequestError } = require("../errors");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getRunningRecordings = async (_req, res) => {
    const runningRecordings = await prisma.runningRecording.findMany({});

    if(!runningRecordings) {
        throw new BadRequestError("could not fetch running recordings");
    }

    return res.status(StatusCodes.OK).json({msg: "fetched running recordings successfully", data: runningRecordings})
}

module.exports = {getRunningRecordings};
const { PrismaClientKnownRequestError } = require("@prisma/client");
const { StatusCodes } = require("http-status-codes");

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    code: err.code || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong, try again later",
  };

  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2025":
        customError.msg = "Record not found.";
        customError.code = StatusCodes.NOT_FOUND;
        break;

      case "P2002":
        customError.msg = `${err.meta.target} already exists`;
        customError.code = StatusCodes.CONFLICT;
        break;
      case "P2000":
        customError.msg = "Invalid data provided.";
        customError.code = StatusCodes.BAD_REQUEST;
        break;

      case "P2001":
        customError.msg = "A unique constraint failed.";
        customError.code = StatusCodes.BAD_REQUEST;
        break;

      case "P2016":
        customError.msg = "Invalid relation data provided.";
        customError.code = StatusCodes.BAD_REQUEST;
        break;

      case "P2021":
        customError.msg = "Invalid Prisma Client usage.";
        customError.code = StatusCodes.INTERNAL_SERVER_ERROR;
        break;
      default:
        console.log(err);
        break;
    }
  }

  return res.status(customError.code).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;

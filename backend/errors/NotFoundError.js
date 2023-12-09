const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./CustomApiError");

class BadRequestError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

module.exports = BadRequestError;

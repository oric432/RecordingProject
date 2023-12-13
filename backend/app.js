const express = require("express");
const app = express();
const morgan = require("morgan");
const http = require("http");
const { SocketServer, minioClient } = require("./http_server");
require("dotenv").config();
require("express-async-errors");

// extra security middleware
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");

//middleware
app.use(cors());
app.use(helmet());
app.use(xss());
app.use(morgan("dev"));
app.use(express.json());

// routers
const recordingRouter = require("./routes/recordings");

//routes
app.use("/api/v1/recordings", recordingRouter);

//error middleware
const errorHandlerMiddleware = require("./middlewares/errorHandlerMiddleware");
app.use(errorHandlerMiddleware);

//server initialization
const port = process.env.PORT || 3001;

const startApplication = () => {
  const httpServer = http.createServer();
  const socketServer = new SocketServer(
    httpServer,
    minioClient,
    "10.0.0.39",
    3002
  );

  socketServer.startServer();

  app.listen(port, () => console.log(`Server is listening on port ${port}`));
};

startApplication();

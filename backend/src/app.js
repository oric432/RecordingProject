const express = require("express");
const app = express();
const morgan = require("morgan");
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
const recordingRouter = require("./routes/recordings.js");
const runningRecordingRouter = require("./routes/runningRecording.js");

//routes
app.use("/api/v1/recordings", recordingRouter);
app.use("/api/v1/runningRecording", runningRecordingRouter);

//error middleware
const errorHandlerMiddleware = require("./middlewares/errorHandlerMiddleware.js");
app.use(errorHandlerMiddleware);

//server initialization
const SocketIOClient = require("./recording_connection/recordingClient");

const port = process.env.PORT || 3001;

const startApplication = () => {
  const socketClient = new SocketIOClient("http://localhost:3005");
  socketClient.setupEvents();
  app.listen(port, () => console.log(`Server is listening on port ${port}`));
};

startApplication();

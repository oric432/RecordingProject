const http = require("http");
const socketIO = require("socket.io");
const { AudioRecorder } = require("./server2");

const httpServer = http.createServer();
const ioServer = socketIO(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const getStatuses = (recordings) => {
  const data = [];
  for (const recording of recordings.values()) {
    if (recording instanceof AudioRecorder) {
      data.push(recording.getServerData());
    } else {
      console.error("Invalid recording object:", recording);
    }
  }

  return data;
};

const recordings = new Map();

ioServer.on("connection", (socket) => {
  console.log(`new client has connected, id: ${socket.id}`);

  socket.on("startRecording", (recordingData) => {
    const { multicastAddress, port } = recordingData;
    const audioRecorder = new AudioRecorder(multicastAddress, port);
    recordings.set(`${multicastAddress}:${port}`, audioRecorder);
    ioServer.emit("recordingsStatus", getStatuses(recordings));
  });

  socket.on("stopRecording", (recordingData) => {
    const { multicastAddress, port } = recordingData;
    const audioRecorder = recordings.get(`${multicastAddress}:${port}`);
    audioRecorder.handleDisconnect();
    recordings.delete(`${multicastAddress}:${port}`);
    ioServer.emit("recordingsStatus", getStatuses(recordings));
  });

  ioServer.emit("recordingsStatus", getStatuses(recordings));
});

module.exports = httpServer;

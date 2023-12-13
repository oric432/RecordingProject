const { Server } = require("socket.io");
const { saveRecording } = require("./minioClient");

class SocketServer {
  constructor(httpServer, minioClient, ip, port) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
      },
    });
    this.minioClient = minioClient;
    this.IP = ip;
    this.PORT = port;

    this.backendClients = 0;
    this.audioBuffer = [];
    this.started = null;
    this.recording = null;

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.io.on("connection", (socket) => {
      this.handleConnection(socket);
    });
  }

  handleConnection(socket) {
    const socketId = socket.id;
    const isBackend = socket.handshake.query.type !== "frontend";
    console.log(`new client connected: ${socketId}, isBackend = ${isBackend}`);

    if (isBackend) {
      this.handleBackendConnection();
    } else {
      this.handleFrontendConnection();
    }

    socket.on("audio", (data) => {
      this.handleAudioData(data);
    });

    socket.on("disconnect", async () => {
      this.handleDisconnect(socketId, isBackend);
    });
  }

  handleBackendConnection() {
    this.backendClients++;

    // check whether its the first backend client to join, if it is, save the recording starting time
    if (this.backendClients === 1) {
      this.started = new Date();
      this.recording = null;
      this.io.emit("startRecording", {
        mcAddress: this.IP,
        port: this.PORT,
        uptime: new Date() - this.started,
      });
    }
  }

  handleFrontendConnection() {
    if (!this.backendClients && this.recording) {
      this.io.emit("recordingStatus", { recording: this.recording });
    }
  }

  handleAudioData(data) {
    const decodedAudio = Buffer.from(data, "base64");
    this.audioBuffer.push(decodedAudio);
  }

  async handleDisconnect(socketId, isBackend) {
    console.log(`client ${socketId} disconnected`);
    this.backendClients = isBackend
      ? this.backendClients - 1
      : this.backendClients;

    if (isBackend && this.backendClients === 0 && this.audioBuffer.length > 0) {
      const { success, name } = await saveRecording(this.audioBuffer);
      if (success) {
        this.recording = {
          MCAddress: `${this.IP}:${this.PORT}`,
          date: this.started,
          recordingLength: Math.floor((new Date() - this.started) / 1000),
          filePath: name,
        };
        this.io.emit("stopRecording", { recording: this.recording });
        this.audioBuffer = [];
        this.started = null;
      } else {
        console.error(`error saving recordings: ${name}`);
      }
    }
  }

  startServer() {
    console.log(
      `Attempting to start server on port ${this.PORT} and ip ${this.IP}`
    );
    this.io.listen(this.PORT, { host: this.IP }, () => {
      console.log(`Server listening on port ${this.PORT} and ip ${this.IP}`);
    });
  }
}

module.exports = SocketServer;

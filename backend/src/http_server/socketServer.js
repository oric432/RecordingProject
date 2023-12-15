const { Server } = require("socket.io");
const { saveRecording } = require("./minioClient");
const mixAudioBuffers = require("./merge");
const {
  findLargestBufferLength,
  findNumberOfBackendConnectedClients,
  formatBytes,
} = require("./utils");

/**
 * * SocketServer Class
 * @param io socket.io server
 * @param minioClient minio client, used to communicate with the cloud service
 * @param IP ip address
 * @param PORT port address
 * @param clients a map of clients used to keep tack of connected clients and disconnected clients' buffer
 * @param started a boolean value that checks if a recording is in progress
 * @param maxBufferLength keeps track of the maximum buffer length, used for padding buffers (allocating 0's)
 * @param recording keeps track if a recording has ended and is saved, used for backend clients access to the session
 *                  and for updating the frontend
 */
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

    this.clients = new Map();
    this.started = null;
    this.maxBufferLength = 0;
    this.recording = null;

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.io.on("connection", (socket) => {
      this.handleConnection(socket);
    });
  }

  /**
   * * Handle client connection
   * @param socket client's socket
   */
  handleConnection(socket) {
    const socketId = socket.id;
    // Check whether the socket came from the fronted or not
    const isBackend = socket.handshake.query.type !== "frontend";

    console.log(`New client connected: ${socketId}, isBackend = ${isBackend}`);

    // Store client information
    this.clients.set(socketId, {
      isBackend,
      audioBuffer: Buffer.from([]),
      startedRecording: new Date(),
      connected: true,
    });

    // check if the frontend client has saved the recording to the db, not the minio client which the server does
    socket.on("savedToDb", (saved) => {
      console.log("saved to db");
      this.started = null;
      this.recording = null;
      this.clients.clear();
      socket.disconnect();
    });

    if (isBackend) {
      // if the server still keeps a recording, kick backend sockets who are trying to join
      if (this.recording) {
        socket.emit("disconnectResponse", "Session has not fully restarted");
        socket.disconnect();
      }
      this.handleBackendConnection(socketId);
    } else {
      this.handleFrontendConnection();
    }

    socket.on("audio", (data) => {
      this.handleAudioData(socketId, data);
    });

    socket.on("disconnect", () => {
      if (isBackend) {
        this.handleBackendDisconnect(socketId);
      }
    });
  }

  /**
   * * Handle backend clients
   * @param socketId unique identifier for the socket
   */
  handleBackendConnection(socketId) {
    const client = this.clients.get(socketId);

    // if session has'nt started initialize the starting time
    if (!this.started) {
      this.started = new Date();
      // emit to the frontend that a recording has started
      this.io.emit("startRecording", {
        mcAddress: this.IP,
        port: this.PORT,
        uptime: 0,
      });
    } // if session is running pad buffer to the client (allocate 0's)
    else {
      this.maxBufferLength = findLargestBufferLength(this.clients);
      client.audioBuffer = Buffer.alloc(this.maxBufferLength);
    }
  }

  /**
   * * Handle frontend clients
   * @param socketId unique identifier for the socket
   */
  handleFrontendConnection() {
    if (this.started) {
      // send the right recording to the frontend client
      let sendRecording = {};
      // if there is a saved recording, send it
      if (this.recording) {
        sendRecording = this.recording;
      }
      // if there isn't a saved recording, send updates on the ongoing recording
      else {
        sendRecording = {
          MCAddress: `${this.IP}:${this.PORT}`,
          date: this.started,
          recordingLength: Math.floor((new Date() - this.started) / 1000),
          isRecording: true,
          filePath: null,
          fileSize: null,
        };
      }
      // get recording status for the frontend
      this.io.emit("recordingStatus", { recording: sendRecording });
    }
  }

  /**
   * * Handle audio transmission
   * @param socketId unique identifier for the socket
   * @param data audio represented by byte chunks coming from the backend clients
   */
  handleAudioData(socketId, data) {
    const client = this.clients.get(socketId);

    // if a client exist add data to the existing buffer
    if (client) {
      const decodedAudio = Buffer.from(data, "base64");
      client.audioBuffer = Buffer.concat([client.audioBuffer, decodedAudio]);
    }
  }

  /**
   * * Handle disconnected clients
   * @param socketId unique identifier for the socket
   */
  async handleBackendDisconnect(socketId) {
    console.log(`backend client ${socketId} disconnected`);
    const client = this.clients.get(socketId);

    client.endedRecording = new Date();
    client.connected = false;

    // keep track of maximum buffer length
    if (client.audioBuffer.length > this.maxBufferLength) {
      this.maxBufferLength = client.audioBuffer.length;
    }

    // if the recording has ended save merge buffers and save recording
    if (findNumberOfBackendConnectedClients(this.clients) == 0) {
      // create audio buffers array, containing all audio buffers of every backend client
      const audioBuffers = [];
      for (const key of this.clients.keys()) {
        const c = this.clients.get(key);
        if (c.isBackend) {
          console.log(`c-${key}, buffer length: `);
          audioBuffers.push({
            audio: Buffer.concat([
              c.audioBuffer,
              // pad 0's from the right if needed
              Buffer.alloc(this.maxBufferLength - c.audioBuffer.length),
            ]),
            start: c.startedRecording,
            end: client.endedRecording,
          });
        }
      }

      for (let i = 0; i < audioBuffers.length; i++) {
        console.log("audio length: ", audioBuffers[i].audio.length);
        console.log("duration: ", audioBuffers[i].end - audioBuffers[i].start);
        console.log("buffer length: ", audioBuffers[i].audio.length);
        console.log(audioBuffers[i].audio);
      }

      // mix audios
      const mixedBuffer = mixAudioBuffers(
        audioBuffers.map(({ audio }) => audio)
      );

      // save recording to minio cloud service
      const { success, data } = await saveRecording(mixedBuffer);

      // if the saving succeeds send to the frontend appropriate metadata
      if (success) {
        const recording = {
          MCAddress: `${this.IP}:${this.PORT}`,
          date: this.started,
          recordingLength: Math.floor((new Date() - this.started) / 1000),
          filePath: data.name,
          fileSize: formatBytes(mixedBuffer.length),
        };

        this.io.emit("stopRecording", { recording });
        this.recording = recording;
      } else {
        console.error(`Error saving recordings: ${data.error.message}`);
      }
    }
  }

  handelFrontendDisconnect(socketId) {
    console.log(`frontend client ${socketId} disconnected`);
    this.clients.delete(socketId);
  }

  /**
   * * Start io server
   */
  startServer() {
    console.log(
      `Attempting to start server on port ${this.PORT} and IP ${this.IP}`
    );
    this.io.listen(this.PORT, { host: this.IP }, () => {
      console.log(`Server listening on port ${this.PORT} and IP ${this.IP}`);
    });
  }
}

module.exports = SocketServer;

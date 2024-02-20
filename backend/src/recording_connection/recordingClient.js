const socketIOClient = require("socket.io-client");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class SocketIOClient {
  constructor(serverUrl) {
    this.socket = socketIOClient(serverUrl);
  }

  setupEvents() {
    // Listen for the "connect" event
    this.socket.on("connect", () => {
      this.onConnect();
    });

    // Listen for the "saveToDatabase" event
    this.socket.on("saveTemporaryRecording", (data) => {
      this.onSaveToDatabase(data);
    });

    this.socket.on("deleteTemporaryRecording", (data) => {
      this.onDeleteFromDatabase(data.id);
      this.onAddRecordingToDatabase(data);
    });

    // Listen for the "disconnect" event
    this.socket.on("disconnect", () => {
      this.onDisconnect();
    });

    // Listen for the "error" event
    this.socket.on("error", (error) => {
      this.onError(error);
    });
  }

  onConnect() {
    console.log("Connected to Socket.IO server");
  }

  async onSaveToDatabase(data) {
    try {
      const recording = await prisma.runningRecording.create({ data });

      if (!recording) {
        console.log("could not add recording");
        return;
      }

      console.log("added temporary recording successfully");
    } catch (error) {
      console.error(error);
    }
  }

  async onDeleteFromDatabase(id) {
    try {
      const recording = await prisma.runningRecording.delete({
        where: {
          id,
        },
      });

      if (!recording) {
        console.log("could not remove recording");
        return;
      }

      console.log("removed temporary recording successfully");
    } catch (error) {
      console.error(error);
    }
  }

  async onAddRecordingToDatabase(data) {
    try {
      const { id, ...rest } = data;
      const recording = await prisma.recording.create({
        data: rest,
      });

      if (!recording) {
        console.log("could not add recording");
      }

      console.log("added recording successfully");
    } catch (error) {
      console.error(error);
    }
  }

  onDisconnect() {
    console.log("Disconnected from Socket.IO server");
  }

  onError(error) {
    console.error("Socket.IO error:", error);
  }
}

module.exports = SocketIOClient;

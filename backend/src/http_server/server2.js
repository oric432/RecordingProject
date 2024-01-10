const dgram = require("dgram");
const {
  mergeBuffers,
  normalizeBuffer,
  normalizeBuffer2,
  normalizeLoudness,
} = require("./merge");
const { parseRtpPacket, saveRecordingsToDB } = require("./utils");
const { v4: uuidv4 } = require("uuid");
const { saveRecording } = require("./minioClient");

class AudioRecorder {
  constructor(multicastAddress, port) {
    // Constants
    this.MULTICAST_ADDR = multicastAddress;
    this.PORT = port;
    this.SAMPLE_RATE = 44100;
    this.BIT_PER_SAMPLE = 16;
    this.DURATION = 5 * 1000; // 5 seconds in ms
    this.BPMS = (this.SAMPLE_RATE * this.BIT_PER_SAMPLE) / 8 / 1000; // 88.2
    this.SESSION_ID = uuidv4();

    // Server variables
    this.recordingCount = 0;
    this.udpServer = dgram.createSocket({ type: "udp4", reuseAddr: true });
    this.buffer = Buffer.alloc(this.BPMS * this.DURATION); // 882000 bytes
    this.startedDate = new Date();
    this.count = 0;
    this.clients = new Map();
    this.offset = 0;
    this.offsets = [];

    this.setupServer();
  }

  setupServer() {
    this.udpServer.on("error", (err) => {
      console.log(`Server error:\n${err.stack}`);
      this.udpServer.close();
    });

    this.udpServer.on("message", (msg, rinfo) => {
      this.handleMessage(msg, rinfo);
    });

    this.udpServer.bind(this.PORT, this.MULTICAST_ADDR);

    process.on("SIGINT", () => {
      this.handleDisconnect();
    });
  }

  handleMessage(msg, rinfo) {
    const rtpPacket = parseRtpPacket(msg);

    if (rtpPacket) {
      this.updateClient(rtpPacket);
      this.processData(msg, rtpPacket);
    } else {
      console.log("Received non-RTP packet");
    }
  }

  updateClient(rtpPacket) {
    if (!this.clients.has(rtpPacket.ssrc)) {
      this.clients.set(rtpPacket.ssrc, {
        timestamp: 0,
        startedDate: new Date(),
      });
    } else {
      const existingClient = this.clients.get(rtpPacket.ssrc);

      this.clients.set(rtpPacket.ssrc, {
        timestamp: rtpPacket.timestamp,
        startedDate: existingClient.startedDate,
      });
    }
  }

  async processData(msg, rtpPacket) {
    const client = this.clients.get(rtpPacket.ssrc);
    console.log("ssrc: ", rtpPacket.ssrc);
    console.log("sequence number: ", rtpPacket.sequenceNumber);
    console.log("timestamp: ", rtpPacket.timestamp);

    // remove header to get only the required data
    let data = msg.subarray(12, msg.length);
    // calculate how much time it took for the data to move : (data[bytes] / BPMS[bytes/ms] = transfer-rate[ms])
    const bpmsg = Math.round(data.length / this.BPMS);

    console.log("count w: ", this.count);

    if (this.count === 0) {
      this.count = Math.round(
        ((new Date() - this.startedDate) / bpmsg) * data.length
      );
    } else {
      this.count += data.length;
    }

    // calculate the time that has passed since the recording was up : (client-joined[date] - recording-started[date] = ms-offset[ms])
    const currentTime = client.startedDate - this.startedDate;
    console.log("time offset: ", currentTime);
    console.log("this.offset: ", this.offset);

    let start = Math.round(
      ((currentTime + rtpPacket.timestamp) / bpmsg) * data.length -
        this.buffer.length * this.recordingCount
    );

    if (start >= 0) {
      if (start + data.length > this.buffer.length) {
        let left = this.buffer.length - start;
        left = left % 2 !== 0 ? left - 1 : left;
        mergeBuffers(this.buffer, data.subarray(0, left), start, start + left);

        data = data.subarray(left, data.length);
        start = 0;

        const recordingBuffer = Buffer.from(this.buffer);
        // normalizeLoudness(recordingBuffer);

        // write to minio
        await saveRecording(
          this.SESSION_ID,
          this.recordingCount++,
          recordingBuffer
        );

        this.buffer.fill(0);
        this.count = data.length;
      }

      mergeBuffers(this.buffer, data, start, start + data.length);
    }
  }

  async handleDisconnect() {
    this.udpServer.close();
    console.log(`${this.MULTICAST_ADDR}:${this.PORT} audio session has closed`);
    const cutBuffer = this.buffer.subarray(0, this.count);
    // normalizeLoudness(cutBuffer);

    await saveRecording(this.SESSION_ID, this.recordingCount, cutBuffer);
    await saveRecordingsToDB({
      MCAddress: `${this.MULTICAST_ADDR}:${this.PORT}`,
      name: `${this.SESSION_ID}`,
      date: this.startedDate,
      recordingLength:
        this.DURATION * this.recordingCount +
        parseInt(cutBuffer.length / this.BPMS),
      filePath: this.SESSION_ID,
      fileSize: (
        this.buffer.length * this.recordingCount +
        cutBuffer.length
      ).toString(),
      recordingCount: this.recordingCount,
    });
  }

  getServerData() {
    return {
      id: this.SESSION_ID,
      multicastAddress: this.MULTICAST_ADDR,
      port: this.PORT,
      started: this.startedDate,
    };
  }
}

module.exports = { AudioRecorder };

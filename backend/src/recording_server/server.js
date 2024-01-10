const dgram = require("dgram");
const { mergeBuffers, normalizeBuffer } = require("./merge");
const wav = require("wav");
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
    this.lastBuffer = Buffer.alloc(0);
    this.startedDate = new Date();
    this.clients = new Map();
    this.count = 0;

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
        startedDate: new Date(),
        offset: 0,
      });
    } else {
      const existingClient = this.clients.get(rtpPacket.ssrc);

      this.clients.set(rtpPacket.ssrc, {
        startedDate: existingClient.startedDate,
        offset: existingClient.offset,
      });
    }
  }

  processData(msg, rtpPacket) {
    const client = this.clients.get(rtpPacket.ssrc);
    console.log("ssrc: ", rtpPacket.ssrc);
    console.log("sequence number: ", rtpPacket.sequenceNumber);
    console.log("timestamp: ", rtpPacket.timestamp);
    // remove header to get only the required data
    let data = msg.subarray(12, msg.length);
    // calculate how much time it took for the data to move : (data[bytes] / BPMS[bytes/ms] = transfer-rate[ms])
    const bpmsg = Math.round(data.length / this.BPMS);

    console.log("count: ", this.count);

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

    // calculate the byte offset : (round((ms-offset[ms] + timestamp[ms]) / transfer-rate[ms]) * bytes-transferred = byte-offset)
    let start =
      Math.round((currentTime + rtpPacket.timestamp) / bpmsg) * data.length -
      this.buffer.length * this.recordingCount +
      client.offset;

    console.log("start index: ", start);
    console.log("start + data.length: ", start + data.length);

    if (start < 0) {
      this.clients.set(rtpPacket.ssrc, {
        ...client,
        offset: data.length,
      });

      start = 0;
    }

    if (start + data.length > this.buffer.length) {
      const left = this.buffer.length - start;
      this.recordingCount += 1;
      this.count = data.length - left;

      mergeBuffers(this.buffer, data, start, start + left);

      data = data.subarray(left, data.length);

      const recordingBuffer = Buffer.from(this.buffer);
      normalizeBuffer(recordingBuffer);
      // byteToText(recordingBuffer, this.recordingCount);

      const writer = new wav.FileWriter(
        `audio_recording_${this.recordingCount}.wav`,
        {
          channels: 1,
          sampleRate: 44100,
          bitDepth: 16,
        }
      );

      writer.write(recordingBuffer);
      writer.end();

      this.lastBuffer = Buffer.from(this.buffer);
      this.buffer.fill(0);

      mergeBuffers(this.buffer, data, 0, data.length);
    } else {
      mergeBuffers(this.buffer, data, start, start + data.length);
    }
  }

  handleDisconnect() {
    this.udpServer.close();
    console.log(`${this.MULTICAST_ADDR}:${this.PORT} audio session has closed`);
    const cutBuffer = this.buffer.subarray(0, this.count);
    normalizeBuffer(cutBuffer);
    // saveRecording(this.SESSION_ID, this.recordingCount, this.buffer)
    //   .then((result) => {
    //     if (result.success) {
    //       console.log(
    //         `Recording saved successfully to minio. File name: ${result.name}`
    //       );
    //       this.buffer.fill(0);
    //       this.recordingCount += 1;
    //       saveRecordingsToDB(this.SESSION_ID);
    //     } else {
    //       console.error(`Failed to save recording. Error: ${result.name}`);
    //     }
    //   })
    //   .catch((error) => {
    //     console.error(`An unexpected error occurred: ${error}`);
    //   });

    const writer = new wav.FileWriter("audio_recording.wav", {
      channels: 1,
      sampleRate: 44100,
      bitDepth: 16,
    });

    writer.write(cutBuffer);

    writer.end();

    console.log("wav file saved");
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

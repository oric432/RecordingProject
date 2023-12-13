import { useEffect } from "react";
import { io } from "socket.io-client";

export const useSocket = (
  url,
  type,
  onStartRecording,
  onStopRecording,
  onRecordingStatus
) => {
  useEffect(() => {
    const socket = io(url, { query: { type } });

    socket.on("startRecording", onStartRecording);
    socket.on("stopRecording", onStopRecording);
    socket.on("recordingStatus", onRecordingStatus);

    return () => {
      socket.disconnect();
    };
  }, []);
};

import axios from "axios";

export const recordingsFetch = axios.create({
  baseURL: "http://localhost:3000/api/v1/recordings",
});

export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedTime = [hours, minutes, remainingSeconds]
    .map((unit) => (unit < 10 ? `0${unit}` : `${unit}`))
    .join(":");

  return formattedTime;
};

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

export const orderData = (value, data) => {
  const orderedData = [...data];

  switch (value) {
    case 0:
      orderedData.sort((a, b) => a.date.localeCompare(b.date));
      break;
    case 1:
      orderedData.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 2:
      orderedData.sort((a, b) => a.recordingLength - b.recordingLength);
      break;
  }

  return orderedData;
};

export const filterData = (value, data) => {
  const filteredData = data.filter((recording) =>
    recording?.name?.toLowerCase().includes(value.toLowerCase())
  );

  return filteredData;
};

import axios from "axios";

export const recordingsFetch = axios.create({
  baseURL: "http://localhost:3000/api/v1/recordings",
});

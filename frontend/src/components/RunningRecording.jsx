import { useEffect, useState } from "react";
import { useAddRecording } from "../custom_hooks/CustomFetchHooks";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { useSocket } from "../custom_hooks/CustomHooks";
import CounterComponent from "./CounterComponent";

const RunningRecording = () => {
  const { addRecording, isLoading } = useAddRecording();
  const [name, setName] = useState("");
  const [multicastAddress, setMulticastAddress] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [uptime, setUptime] = useState(0);

  useSocket(
    "http://10.0.0.39:3002",
    "frontend",
    //recording started
    ({ mcAddress, port, uptime }) => {
      setMulticastAddress(`${mcAddress}:${port}`);
      setIsRecording(true);
      setUptime(uptime);
    },
    // recording stopped
    ({ recording }) => {
      setIsRecording(false);
      setRecording(recording);
      setUptime(recording?.recordingLength);
    },
    // recording status
    ({ recording }) => {
      setRecording(recording);
      setMulticastAddress(recording?.MCAddress);
      setIsRecording(recording?.isRecording);
      setUptime(recording?.recordingLength);
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(recording);
    if (recording) {
      addRecording({ ...recording, name });
      setName("");
    } else {
      toast.error("there is not a saved recording");
    }
  };

  return (
    <div className="running_container">
      <span className="container_label">Running Recording</span>
      <div className="running">
        <div className="labels">
          <label>{multicastAddress || "MC Address"}</label>
          <label>is recording: {isRecording ? "true" : "false"}</label>
          length: {isRecording ? <CounterComponent count={uptime} /> : uptime}
        </div>
        <div className="boxContainer">
          {Array.from({ length: 15 }, (_, index) => (
            <div
              key={index + 1}
              className={
                isRecording
                  ? `box box${index + 1} bg-blue-500`
                  : `box bg-blue-500`
              }
            ></div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="form_box">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            {isLoading ? "..." : "Add"}
          </button>
          <input
            type="text"
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          ></input>
        </form>
      </div>
    </div>
  );
};
export default RunningRecording;

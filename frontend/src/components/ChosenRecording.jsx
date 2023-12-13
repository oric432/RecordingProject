import { useContext, useEffect, useState } from "react";
import { MyContext } from "../MyContext";
import { useFetchRecording } from "../custom_hooks/CustomFetchHooks";
import AudioPlayer from "./AudioPlayer";
import { formatTime } from "../utils";

const ChosenRecording = () => {
  const { chosenRecording } = useContext(MyContext);
  const { isLoading, error, data } = useFetchRecording(chosenRecording);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey((prevKey) => prevKey + 1);
  }, [chosenRecording]);

  if (!chosenRecording) {
    return (
      <div className="chosen_container">
        <span className="container_label">Chose Recording</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="chosen_container">
        <span className="container_label">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chosen_container">
        <span className="container_label">error: {error}</span>
      </div>
    );
  }

  return (
    <div className="chosen_container">
      <span className="container_label">Chosen Recording</span>
      <div className="chosen">
        <div className="labels">
          <label>name: {chosenRecording.name || "Recording Name"}</label>
          <label>
            Length:
            {formatTime(chosenRecording.recordingLength) || "Recording Length"}
          </label>
        </div>
        <AudioPlayer
          key={key}
          audioUrl={data?.presignedUrl}
          audioDuration={chosenRecording.recordingLength}
        />
      </div>
    </div>
  );
};

export default ChosenRecording;

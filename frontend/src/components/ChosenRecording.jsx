import { useContext } from "react";
import { FaPlay } from "react-icons/fa";
import { IoPlayBack, IoPlayForward } from "react-icons/io5";
import { MyContext } from "../MyContext";
import Slider from "@mui/material/Slider";

const ChosenRecording = () => {
  const { chosenRecording } = useContext(MyContext);

  return (
    <div className="chosen_container">
      <h1>Chosen Recording</h1>
      <div className="chosen">
        <div className="labels">
          <label>{chosenRecording?.name || "Recording Name"}</label>
          <label>Recording Length</label>
          <label>Running Length</label>
        </div>
        <Slider
          defaultValue={50}
          aria-label="Default"
          valueLabelDisplay="auto"
        />
        <div className="icons">
          <button type="button">
            <IoPlayBack color="rgb(59 130 246)" size={42} />
          </button>
          <button type="button">
            <FaPlay color="rgb(59 130 246)" size={42} />
          </button>
          <button type="button">
            <IoPlayForward color="rgb(59 130 246)" size={42} />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChosenRecording;

import { useState } from "react";
import "./App.css";
import ChosenRecording from "./components/ChosenRecording";
import RecordingList from "./components/RecordingList";
import RunningRecording from "./components/RunningRecording";
import { MyContext } from "./MyContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RunningRecordings from "./components/RunningRecordings";

function App() {
  const [chosenRecording, setChosenRecording] = useState(null);
  return (
    <>
      <ToastContainer />
      <MyContext.Provider value={{ chosenRecording, setChosenRecording }}>
        <RecordingList />
        <RunningRecordings />
        {/* <RunningRecording /> */}
        <ChosenRecording />
      </MyContext.Provider>
    </>
  );
}

export default App;

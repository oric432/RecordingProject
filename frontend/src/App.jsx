import { useState } from "react";
import "./App.css";
import ChosenRecording from "./components/ChosenRecording";
import RecordingList from "./components/RecordingList";
import RunningRecording from "./components/RunningRecording";
import { MyContext } from "./MyContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [chosenRecording, setChosenRecording] = useState({});
  return (
    <>
      <ToastContainer />
      <MyContext.Provider value={{ chosenRecording, setChosenRecording }}>
        <RecordingList />
        <RunningRecording />
        <ChosenRecording />
      </MyContext.Provider>
    </>
  );
}

export default App;

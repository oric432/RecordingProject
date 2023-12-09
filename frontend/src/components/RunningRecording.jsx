import { useState } from "react";
import { useAddRecording } from "../custom_hooks/CustomFetchHooks";

const RunningRecording = () => {
  const { addRecording, isLoading } = useAddRecording();
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    addRecording({ name });
  };

  return (
    <div className="running_container">
      <h1>Running Recording</h1>
      <div className="running">
        <div className="labels">
          <label>MC Address</label>
          <label>Time Running</label>
        </div>
        <div className="boxContainer">
          {Array.from({ length: 15 }, (_, index) => (
            <div
              key={index + 1}
              className={`box box${index + 1} bg-blue-500`}
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

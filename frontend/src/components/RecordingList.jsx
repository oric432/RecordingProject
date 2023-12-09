import { useContext, useEffect, useState } from "react";
import { useFetchRecordings } from "../custom_hooks/CustomFetchHooks";
import Recording from "./Recording";
import { MyContext } from "../MyContext";
import { FaSearch } from "react-icons/fa";
import { InputLabel, MenuItem, Select } from "@mui/material";

const RecordingList = () => {
  const { isLoading, error, data } = useFetchRecordings();
  const { setChosenRecording } = useContext(MyContext);
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState(0);
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    if (data) {
      setRecordings(data);
    }
  }, [data]);

  if (isLoading) return "Data is loading...";
  if (error) return error.message;

  const changeOrder = ({ target: { value } }) => {
    setOrder(value);

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

    setRecordings(orderedData);
  };

  const filterData = ({ target: { value } }) => {
    setSearch(value);

    const filteredData = data.filter((recording) =>
      recording?.name?.toLowerCase().includes(value.toLowerCase())
    );

    setRecordings(filteredData);
  };

  return (
    <div className="recordings_container">
      <h1>Recordings List</h1>
      <div className="w-full flex flex-row justify-around content-center">
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <FaSearch color="rgb(59 130 246)" />
          </div>
          <input
            type="search"
            value={search}
            onChange={filterData}
            className="block w-full p-4 ps-10 shadow appearance-none border rounded text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="Order-By"
            value={order}
            onChange={changeOrder}
          >
            <MenuItem value={0}>Date</MenuItem>
            <MenuItem value={1}>Name</MenuItem>
            <MenuItem value={2}>Length</MenuItem>
            <MenuItem value={3}>File Size</MenuItem>
          </Select>
        </div>
      </div>
      <div className="recordings_list">
        <div className="recording sticky_header">
          <div>Date</div>
          <div>Name</div>
          <div>Length</div>
          <div>File Size</div>
        </div>
        {recordings.map((recording) => (
          <a
            href="#"
            onClick={() => setChosenRecording(recording)}
            key={recording.id}
          >
            <Recording recording={recording} />
          </a>
        ))}
      </div>
    </div>
  );
};

export default RecordingList;

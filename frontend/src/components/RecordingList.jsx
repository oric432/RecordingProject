import { useEffect, useState } from "react";
import { useFetchRecordings } from "../custom_hooks/CustomFetchHooks";
import { FaSearch } from "react-icons/fa";
import { MenuItem, Select } from "@mui/material";
import { filterData, orderData } from "../utils";
import RecordingTable from "./RecordingTable";

const RecordingList = () => {
  const { isLoading, error, data } = useFetchRecordings();
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState(0);
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    if (data) {
      setRecordings(data);
    }
  }, [data]);

  if (isLoading)
    return (
      <div className="recordings_container">
        <span className="container_label">Data is loading...</span>
      </div>
    );
  if (error)
    return (
      <div className="recordings_container">
        <span className="container_label">error: {error.message}</span>
      </div>
    );

  return (
    <div className="recordings_container">
      <span className="container_label">Recordings List</span>
      <div className="w-full flex flex-row justify-around content-center">
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <FaSearch color="rgb(59 130 246)" />
          </div>
          <input
            type="search"
            value={search}
            onChange={({ target: { value } }) => {
              setSearch(value);
              setRecordings(filterData(value, data));
            }}
            className="block w-full p-4 ps-10 shadow appearance-none border rounded text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="Order-By"
            value={order}
            onChange={({ target: { value } }) => {
              setOrder(value);
              setRecordings(orderData(value, data));
            }}
          >
            <MenuItem value={0}>Date</MenuItem>
            <MenuItem value={1}>Name</MenuItem>
            <MenuItem value={2}>Length</MenuItem>
            <MenuItem value={3}>File Size</MenuItem>
          </Select>
        </div>
      </div>
      <RecordingTable recordings={recordings} />
    </div>
  );
};

export default RecordingList;

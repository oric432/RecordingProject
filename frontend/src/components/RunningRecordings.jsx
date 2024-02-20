import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import CounterComponent from "./CounterComponent";
import { useFetchRunningRecordings } from "../custom_hooks/CustomFetchHooks";

const RunningRecordings = () => {
  const {isLoading, error, data} = useFetchRunningRecordings();

  if (isLoading) {
    return (<div className="running_recordings_container">
      <span className="container_label">Running Recordings</span>
      <div className="running_recordings_list">
        Loading...
      </div>
    </div>);
  }

  if(error) {
    return (<div className="running_recordings_container">
      <span className="container_label">Running Recordings</span>
      <div className="running_recordings_list">
        error: {error.message}
      </div>
    </div>);
  }

  return (
    <div className="running_recordings_container">
      <span className="container_label">Running Recordings</span>
      <div className="running_recordings_list">
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>MC Address</TableCell>
                <TableCell>Port</TableCell>
                <TableCell>Time Running</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.map((recording) => {
                const { id, multicastAddress, port, date } = recording;
                const timeOffset = Math.round(
                  (new Date() - new Date(date)) / 1000
                );

                return (
                  <TableRow key={id}>
                    <TableCell
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <div className="boxContainer">
                        {Array.from({ length: 5 }, (_, index) => (
                          <div
                            key={index + 1}
                            className={`box box${index + 1} bg-blue-500`}
                          ></div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{multicastAddress}</TableCell>
                    <TableCell>{port}</TableCell>
                    <TableCell>
                      <CounterComponent count={timeOffset} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};
export default RunningRecordings;

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import CounterComponent from "./CounterComponent";

const RunningRecordings = () => {
  const [recordings, setRecordings] = useState(null);

  useEffect(() => {
    const socket = io("http://127.0.0.1:3005");

    socket.on("recordingsStatus", (recordings) => {
      setRecordings(recordings);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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
              {recordings?.map((recording) => {
                const { id, multicastAddress, port, started } = recording;
                const timeOffset = Math.round(
                  (new Date() - new Date(started)) / 1000
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

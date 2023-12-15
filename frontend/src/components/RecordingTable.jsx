import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useContext, useState } from "react";
import { MyContext } from "../MyContext";

const RecordingTable = ({ recordings }) => {
  const { setChosenRecording } = useContext(MyContext);
  const [selectedRow, setSelectedRow] = useState(null);

  console.log("updated");
  return (
    <div className="recordings_list">
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Date</TableCell>
              <TableCell>name</TableCell>
              <TableCell>length</TableCell>
              <TableCell>size</TableCell>
              <TableCell>mc</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recordings.map((recording) => (
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                onClick={() => {
                  setChosenRecording(recording);
                  setSelectedRow(recording.id);
                }}
                key={recording.id}
                style={
                  recording.id === selectedRow
                    ? { backgroundColor: "#f5f5f5" }
                    : {}
                }
              >
                <TableCell component="th" scope="row">
                  {new Date(recording?.date).toUTCString()}
                </TableCell>
                <TableCell>{recording?.name}</TableCell>
                <TableCell>{recording?.recordingLength}</TableCell>
                <TableCell>{recording?.fileSize || "10mb"}</TableCell>
                <TableCell>{recording?.MCAddress}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
export default RecordingTable;

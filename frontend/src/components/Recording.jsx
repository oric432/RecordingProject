const Recording = ({ recording }) => {
  return (
    <div className="recording">
      <div>{new Date(recording?.date).toUTCString()}</div>
      <div>{recording?.name}</div>
      <div>{recording?.recordingLength}</div>
      <div>{recording?.fileSize || "10mb"}</div>
    </div>
  );
};
export default Recording;

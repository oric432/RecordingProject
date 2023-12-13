import { Slider } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import { IoPlayBack, IoPlayForward } from "react-icons/io5";
import { formatTime } from "../utils";

const AudioPlayer = ({ audioUrl, audioDuration }) => {
  const JUMP_INTERVAL = 5;
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audioDuration);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audioElement = audioRef.current;

    if (audioElement) {
      const updateTime = () => {
        setCurrentTime(audioElement.currentTime);
        if (!isNaN(audioElement.duration) && isFinite(audioElement.duration)) {
          setDuration(audioElement.duration);
        }
      };

      audioElement.addEventListener("timeupdate", updateTime);

      return () => {
        audioElement.removeEventListener("timeupdate", updateTime);
      };
    }
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  const handleProgressBar = (e) => {
    const newTime = e.target.value;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <>
      <div className="slider_div">
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
        />
        <label>{formatTime(currentTime)}</label>
        <Slider
          value={currentTime}
          max={duration}
          step={0.01}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => value.toFixed(1) + "s"}
          onChange={handleProgressBar}
          aria-label="Default"
        />
        <label>{formatTime(duration)}</label>
      </div>
      <div className="icons">
        <button
          type="button"
          onClick={() => (audioRef.current.currentTime -= JUMP_INTERVAL)}
        >
          <IoPlayBack color="rgb(59 130 246)" size={42} />
        </button>
        <button type="button" onClick={togglePlay}>
          {isPlaying ? (
            <FaPause color="rgb(59 130 246)" size={42} />
          ) : (
            <FaPlay color="rgb(59 130 246)" size={42} />
          )}
        </button>
        <button
          type="button"
          onClick={() => (audioRef.current.currentTime += JUMP_INTERVAL)}
        >
          <IoPlayForward color="rgb(59 130 246)" size={42} />
        </button>
      </div>
    </>
  );
};
export default AudioPlayer;

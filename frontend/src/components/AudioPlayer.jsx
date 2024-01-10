import { Slider } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import { IoPlayBack, IoPlayForward } from "react-icons/io5";
import { formatTime } from "../utils";

const AudioPlayer = ({ audioUrls, audioDuration }) => {
  const JUMP_INTERVAL = 5;
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioIndex, setAudioIndex] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audioElement = audioRef.current;

    if (audioElement) {
      const updateTime = () => {
        setCurrentTime(audioElement.currentTime + totalDuration);
      };

      audioElement.addEventListener("timeupdate", updateTime);

      const endedHandler = () => {
        playNextAudio();
      };

      audioElement.addEventListener("ended", endedHandler);

      return () => {
        audioElement.removeEventListener("timeupdate", updateTime);
        audioElement.removeEventListener("ended", endedHandler);
      };
    }
  }, [audioIndex, audioUrls, totalDuration]);

  useEffect(() => {
    // Auto-play when component mounts
    if (isPlaying) {
      const audioElement = audioRef.current;
      audioElement.src = audioUrls[audioIndex];
      audioElement.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  }, [isPlaying, audioIndex, audioUrls]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }

    setIsPlaying(!isPlaying);
  };

  const handleProgressBar = (e) => {
    const newTime = e.target.value;
    audioRef.current.currentTime = newTime - totalDuration;
    setCurrentTime(newTime);
  };

  const playNextAudio = () => {
    if (audioIndex < audioUrls.length - 1) {
      setAudioIndex(audioIndex + 1);
      setTotalDuration(totalDuration + audioRef.current.duration);
      audioRef.current.src = audioUrls[audioIndex + 1];
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    } else {
      // Reset to the first audio file if the last one has finished
      setAudioIndex(0);
      setTotalDuration(0);
      setIsPlaying(false);
    }
  };

  return (
    <>
      <div className="slider_div">
        <audio
          ref={audioRef}
          onCanPlayThrough={() => {
            if (isPlaying) {
              audioRef.current.play().catch((error) => {
                console.error("Error playing audio:", error);
              });
            }
          }}
          onEnded={playNextAudio}
          type="audio/wav"
        />
        <label>{formatTime(currentTime)}</label>
        <Slider
          value={currentTime}
          max={totalDuration + audioDuration}
          step={0.01}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => formatTime(value)}
          onChange={handleProgressBar}
          aria-label="Default"
        />
        <label>{formatTime(totalDuration + audioDuration)}</label>
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

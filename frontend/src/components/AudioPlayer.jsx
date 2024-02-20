import { Slider } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import { IoPlayBack, IoPlayForward } from "react-icons/io5";
import { formatTime } from "../utils";

const AudioPlayer = ({ audioUrls, audioDuration }) => {
  const JUMP_INTERVAL = 2;
  const [currentTime, setCurrentTime] = useState(0);
  const [counter, setCounter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioIndex, setAudioIndex] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audioElement = audioRef.current;

    if (audioElement) {
      console.log(audioElement.currentTime);
      const updateTime = () => {
        setCurrentTime(audioElement.currentTime);
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
  }, [audioIndex, audioUrls]);

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
    audioRef.current.currentTime = newTime;
    console.log(newTime);
    console.log(audioRef.current.duration);
    if (newTime >= audioRef.current.duration){
      playNextAudio();
    }
    else if(newTime <= 0)
    {
      playPrevAudio();
    }
    else {
      setCurrentTime(newTime);
    }
  };

  const fastForward = () => {
    if (audioRef.current.currentTime + JUMP_INTERVAL >= audioRef.current.duration)
      playNextAudio();
    else
      audioRef.current.currentTime += JUMP_INTERVAL;
  }

  const fastBackward = () => {
    if (audioRef.current.currentTime - JUMP_INTERVAL <= 0)
      playPrevAudio();
    else
      audioRef.current.currentTime -= JUMP_INTERVAL;
  }

  const playPrevAudio = () => {
    if (audioIndex > 0) {
      setCounter(counter - audioRef.current.duration);
      setAudioIndex(audioIndex - 1);
    }
    else 
    {
      setCounter(0);
      setAudioIndex(audioIndex)
    }
  }

  const playNextAudio = () => {
    if (audioIndex < audioUrls.length - 1) {
      setCounter(counter + audioRef.current.duration);
      setAudioIndex(audioIndex + 1);
    } else {
      // Reset to the first audio file if the last one has finished
      setCounter(0);
      setAudioIndex(0);
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
        <label>{formatTime(currentTime + counter)}</label>
        <Slider
          value={currentTime + counter}
          max={audioDuration}
          step={0.01}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => formatTime(value)}
          onChange={handleProgressBar}
          aria-label="Default"
        />
        <label>{formatTime(audioDuration)}</label>
      </div>
      <div className="icons">
        <button
          type="button"
          onClick={fastBackward}
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
          onClick={fastForward}
        >
          <IoPlayForward color="rgb(59 130 246)" size={42} />
        </button>
      </div>
    </>
  );
};

export default AudioPlayer;

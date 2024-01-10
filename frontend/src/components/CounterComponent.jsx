import React, { useState, useEffect } from "react";
import { formatTime } from "../utils";

const CounterComponent = ({ count }) => {
  const [counter, setCounter] = useState(count);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCounter((prevCounter) => prevCounter + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return <label>{formatTime(counter)}</label>;
};

export default CounterComponent;

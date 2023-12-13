import React, { useState, useEffect } from "react";

const CounterComponent = ({ count }) => {
  const [counter, setCounter] = useState(count);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCounter((prevCounter) => prevCounter + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return <label>{counter}</label>;
};

export default CounterComponent;

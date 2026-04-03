import { analyzeError } from "./debugHelper";

let logs = [];

export const addLog = (type, data, message) => {
  const analysis = analyzeError({ type, data });

  logs.unshift({
    time: new Date().toLocaleTimeString(),
    type,
    data,
    message,
    ...analysis,
  });
};

export const getLogs = () => logs;

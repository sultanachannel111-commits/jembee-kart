import { analyzeError } from "./debugHelper";

let logs = [];

export const addLog = (type, data, message) => {
  const analysis = analyzeError({ type, data });

  logs.unshift({
    time: new Date().toLocaleTimeString(),
    type,
    data,
    message,
    fix: analysis.fix,
    hindi: analysis.hindi,
  });
};

export const getLogs = () => logs;

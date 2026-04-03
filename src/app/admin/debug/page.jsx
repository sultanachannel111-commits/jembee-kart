"use client";

import { useEffect, useState } from "react";
import { getLogs } from "@/lib/debugStore";

export default function DebugPage() {

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    setLogs(getLogs());

    const i = setInterval(() => {
      setLogs(getLogs());
    }, 2000);

    return () => clearInterval(i);
  }, []);

  return (
    <div style={{ padding: 20 }}>

      <h1>🧠 Debug Panel</h1>

      {logs.map((log, i) => (
        <div key={i} style={{
          background: "#111",
          color: "#fff",
          padding: 10,
          marginBottom: 10
        }}>
          <p>{log.message}</p>

          <pre style={{ color: "lime" }}>
            {JSON.stringify(log.data, null, 2)}
          </pre>

          <p>📍 {log.where}</p>
          <p>🧠 {log.hindi}</p>
          <code>{log.fix}</code>

        </div>
      ))}

    </div>
  );
}

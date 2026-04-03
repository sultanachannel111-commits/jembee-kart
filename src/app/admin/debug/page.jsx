"use client";

import { getLogs } from "@/lib/debugStore";

export default function DebugPage() {
  const logs = getLogs();

  return (
    <div style={{ padding: 15 }}>
      <h2>🧠 Smart Debug Panel</h2>

      {logs.length === 0 && <p>No logs yet...</p>}

      {logs.map((log, i) => (
        <div
          key={i}
          style={{
            border: "2px solid red",
            marginBottom: 15,
            padding: 10,
            borderRadius: 10,
            background: "#111",
            color: "#fff",
          }}
        >
          <p>⏰ {log.time}</p>
          <p>📌 {log.type}</p>
          <p>💬 {log.message}</p>

          <pre style={{ color: "#0f0", fontSize: 12 }}>
            {JSON.stringify(log.data, null, 2)}
          </pre>

          <hr />

          <p>📍 Kaha fix karna hai:</p>
          <b>{log.where}</b>

          <p>🧠 Problem kya hai:</p>
          <span>{log.hindi}</span>

          <p>✅ Kya likhna hai:</p>
          <code style={{ color: "lightgreen" }}>{log.fix}</code>

          <br />

          <button
            onClick={() =>
              navigator.clipboard.writeText(log.fix)
            }
            style={{
              marginTop: 10,
              padding: 5,
              background: "green",
              color: "white",
            }}
          >
            📋 Copy Fix
          </button>
        </div>
      ))}
    </div>
  );
}

"use client";

import { getLogs } from "@/lib/debugStore";

export default function DebugPage() {
  const logs = getLogs();

  return (
    <div style={{ padding: 20 }}>
      <h1>🧠 Smart Debug Panel</h1>

      {logs.map((log, i) => (
        <div
          key={i}
          style={{
            border: "2px solid red",
            marginBottom: 15,
            padding: 15,
            borderRadius: 10,
          }}
        >
          <p>⏰ {log.time}</p>
          <p>📌 Type: {log.type}</p>
          <p>💬 {log.message}</p>

          <pre style={{ background: "#000", color: "#0f0", padding: 10 }}>
            {JSON.stringify(log.data, null, 2)}
          </pre>

          {/* 🔥 AUTO FIX */}
          <div style={{ background: "#111", padding: 10, marginTop: 10 }}>
            <p style={{ color: "yellow" }}>🧠 Kya problem hai:</p>
            <p style={{ color: "white" }}>{log.hindi}</p>

            <p style={{ color: "lightgreen" }}>✅ Kya likhna hai:</p>
            <code style={{ color: "#0f0" }}>{log.fix}</code>

            <br />

            <button
              onClick={() => navigator.clipboard.writeText(log.fix)}
              style={{ marginTop: 10 }}
            >
              📋 Copy Fix Code
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

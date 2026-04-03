"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getLogs } from "@/lib/debugStore";

export default function DebugPanel() {

  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {

    // 👥 USERS LOAD
    const loadUsers = async () => {
      const snap = await getDocs(collection(db, "users"));

      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setUsers(data);
    };

    loadUsers();

    // 🔥 DEBUG LOGS LOAD
    const loadLogs = () => {
      setLogs(getLogs());
    };

    loadLogs();

    const interval = setInterval(loadLogs, 2000);

    return () => clearInterval(interval);

  }, []);

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        🧠 System Debug Panel
      </h1>

      {/* USERS */}
      {users.map(user => (
        <div key={user.id} className="border p-4 mb-4 rounded">

          <p><b>UID:</b> {user.id}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Role:</b> {user.role}</p>

          <p><b>Status:</b>
            {user.role === "seller"
              ? " Seller Panel Access"
              : " Customer Only"}
          </p>

        </div>
      ))}

      {/* DEBUG LOGS */}
      <h2 className="text-xl font-bold mt-8 mb-4">
        🚨 Debug Logs
      </h2>

      {logs.length === 0 && (
        <p className="text-gray-500">No logs yet...</p>
      )}

      {logs.map((log, i) => (
        <div key={i} className="bg-black text-white p-3 mb-3 rounded">

          <p>⏰ {log.time}</p>
          <p>📌 {log.type}</p>
          <p>💬 {log.message}</p>

          <pre className="text-green-400 text-xs">
            {JSON.stringify(log.data, null, 2)}
          </pre>

          <p>📍 {log.where}</p>
          <p>🧠 {log.hindi}</p>

          <code className="text-green-400">{log.fix}</code>

        </div>
      ))}

    </div>
  );
}

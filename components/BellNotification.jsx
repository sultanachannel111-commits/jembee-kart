"use client";

import { useState } from "react";

export default function BellNotification() {
  const [open, setOpen] = useState(false);

  // 🔥 Sample notifications (baad me Firestore se aayega)
  const notifications = [
    { id: 1, text: "🎉 New offer available" },
    { id: 2, text: "📦 Your order has been shipped" },
    { id: 3, text: "🔥 Flash sale live now" },
  ];

  return (
    <div className="relative">

      {/* 🔔 Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative text-2xl"
      >
        🔔

        {/* 🔴 Notification Dot */}
        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      {/* 📩 Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-xl rounded-xl p-3 z-50">

          <p className="font-semibold mb-2">Notifications</p>

          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">No notifications</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="text-sm py-1 border-b last:border-none"
              >
                {n.text}
              </div>
            ))
          )}

        </div>
      )}

    </div>
  );
}

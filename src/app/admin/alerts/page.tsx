"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot
} from "firebase/firestore";

export default function AdminAlerts() {

  const [alerts, setAlerts] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");

  const soundRef = useRef<any>(null);

  // ================= 🔔 SOUND =================
  const playSound = () => {
    if (soundRef.current) {
      soundRef.current.play().catch(() => {});
    }
  };

  // ================= 📲 WHATSAPP =================
  const sendWhatsApp = (msg: string) => {
    const phone = "917061369212"; // 👉 apna number daal
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url);
  };

  // ================= 🔥 LIVE LISTENER =================
  useEffect(() => {

    let allData: any[] = [];

    // 🟢 ORDERS
    const unsubOrders = onSnapshot(
      collection(db, "orders"),
      (snap) => {

        const list: any[] = [];

        snap.forEach((doc) => {
          const d: any = doc.data();

          list.push({
            type: "order",
            text: getOrderText(d),
            time: d.createdAt?.seconds || Date.now() / 1000
          });
        });

        allData = [...list, ...alerts];

        setAlerts(sortData(allData));
        playSound();
      }
    );

    // 🔄 RETURNS
    const unsubReturns = onSnapshot(
      collection(db, "returns"),
      (snap) => {

        const list: any[] = [];

        snap.forEach((doc) => {
          const d: any = doc.data();

          const msg = `🔄 Return (${d.status}) - Order ${d.orderId}`;

          list.push({
            type: "return",
            text: msg,
            time: d.createdAt?.seconds || Date.now() / 1000
          });

          // 📲 WhatsApp Alert
          sendWhatsApp(msg);
        });

        allData = [...list, ...alerts];

        setAlerts(sortData(allData));
        playSound();
      }
    );

    return () => {
      unsubOrders();
      unsubReturns();
    };

  }, []);

  // ================= SORT =================
  const sortData = (list: any[]) => {
    return list.sort((a, b) => b.time - a.time);
  };

  // ================= ORDER TEXT =================
  const getOrderText = (d: any) => {

    if (d.status === "PLACED") return `🆕 New Order ₹${d.total}`;
    if (d.status === "PENDING") return `⏳ Pending ₹${d.total}`;
    if (d.status === "DELIVERED") return `✅ Delivered ₹${d.total}`;
    if (d.status === "CANCELLED") return `❌ Cancelled ₹${d.total}`;

    if (d.status === "RETURN_REQUESTED") return `🔄 Return Requested`;
    if (d.status === "RETURN_APPROVED") return `✅ Return Approved`;
    if (d.status === "RETURN_PICKUP") return `🚚 Pickup Started`;
    if (d.status === "RETURN_DONE") return `📦 Received`;
    if (d.status === "EXCHANGE_SHIPPED") return `🎁 Exchange Sent`;

    return "📦 Update";
  };

  // ================= FILTER =================
  const filtered = alerts.filter((a) => {
    if (filter === "ALL") return true;
    return a.type === filter;
  });

  return (
    <div className="p-4">

      {/* 🔊 SOUND */}
      <audio ref={soundRef} src="/notify.mp3" />

      <h1 className="text-2xl font-bold mb-4">
        🔔 Live Alerts
      </h1>

      {/* FILTER */}
      <div className="flex gap-2 mb-4">
        {["ALL", "order", "return"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded ${
              filter === f ? "bg-black text-white" : "bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="space-y-3">

        {filtered.map((a, i) => (
          <div
            key={i}
            className="bg-white p-3 rounded shadow flex justify-between"
          >
            <p>{a.text}</p>

            <span className="text-xs text-gray-400">
              {new Date(a.time * 1000).toLocaleTimeString()}
            </span>
          </div>
        ))}

      </div>

    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function AdminAlerts() {

  const [alerts, setAlerts] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");

  const soundRef = useRef<any>(null);

  // 🔔 SOUND FIX (force play)
  const playSound = () => {
    if (!soundRef.current) return;

    try {
      soundRef.current.currentTime = 0;
      soundRef.current.play();
    } catch (err) {
      console.log("Sound blocked");
    }
  };

  useEffect(() => {

    // 🔥 ORDERS LISTENER
    const unsubOrders = onSnapshot(
      collection(db, "orders"),
      (snap) => {

        const list: any[] = [];

        snap.docChanges().forEach((change) => {
          if (change.type === "added" || change.type === "modified") {

            const d: any = change.doc.data();

            list.push({
              id: change.doc.id,
              type: "order",
              text: getOrderText(d),
              time:
                d.createdAt?.seconds ||
                d.createdAt ||
                Date.now() / 1000
            });
          }
        });

        if (list.length > 0) {
          setAlerts((prev) => {
            const merged = mergeUnique(prev, list);
            return sortData(merged);
          });

          playSound(); // 🔔 ONLY NEW DATA
        }
      }
    );

    // 🔥 RETURNS LISTENER
    const unsubReturns = onSnapshot(
      collection(db, "returns"),
      (snap) => {

        const list: any[] = [];

        snap.docChanges().forEach((change) => {
          if (change.type === "added" || change.type === "modified") {

            const d: any = change.doc.data();

            list.push({
              id: change.doc.id,
              type: "return",
              text: `🔄 Return (${d.status}) - Order ${d.orderId}`,
              time:
                d.createdAt?.seconds ||
                d.createdAt ||
                Date.now() / 1000
            });
          }
        });

        if (list.length > 0) {
          setAlerts((prev) => {
            const merged = mergeUnique(prev, list);
            return sortData(merged);
          });

          playSound(); // 🔔
        }
      }
    );

    return () => {
      unsubOrders();
      unsubReturns();
    };

  }, []);

  // 🔥 REMOVE DUPLICATE
  const mergeUnique = (oldList: any[], newList: any[]) => {
    const map = new Map();

    [...oldList, ...newList].forEach((item) => {
      map.set(item.id + item.type, item);
    });

    return Array.from(map.values());
  };

  // 🔽 SORT
  const sortData = (list: any[]) => {
    return list.sort((a, b) => b.time - a.time);
  };

  // 📦 ORDER TEXT
  const getOrderText = (d: any) => {

    const status = (d.status || "").toUpperCase();

    if (status === "PLACED") return `🆕 New Order ₹${d.total || 0}`;
    if (status === "PENDING") return `⏳ Pending ₹${d.total || 0}`;
    if (status === "DELIVERED") return `✅ Delivered ₹${d.total || 0}`;
    if (status === "CANCELLED") return `❌ Cancelled ₹${d.total || 0}`;

    if (status === "RETURN_REQUESTED") return `🔄 Return Requested`;
    if (status === "RETURN_APPROVED") return `✅ Return Approved`;

    return `📦 Order Update ₹${d.total || 0}`;
  };

  // 🎯 FILTER
  const filtered = alerts.filter((a) => {
    if (filter === "ALL") return true;
    return a.type === filter;
  });

  return (
    <div className="p-4">

      {/* 🔊 SOUND FILE */}
      <audio ref={soundRef} src="/notify.mp3" preload="auto" />

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

        {filtered.length === 0 && (
          <p className="text-gray-500">No alerts yet</p>
        )}

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

"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocs
} from "firebase/firestore";

export default function AdminAlerts() {

  const [alerts, setAlerts] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [canPlay, setCanPlay] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const lastOrderCount = useRef(0);
  const lastReturnCount = useRef(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🔔 AUDIO LOAD
  useEffect(() => {
    audioRef.current = new Audio(window.location.origin + "/notify.mp3");
    audioRef.current.load();
  }, []);

  // 🔔 PLAY SOUND
  const playSound = () => {
    if (!canPlay || !audioRef.current) return;

    try {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } catch (err) {
      console.log("Sound blocked:", err);
    }
  };

  // 🔥 DATA LOAD FUNCTION
  const updateData = async (qOrders: any, qReturns: any) => {
    try {
      const oSnap = await getDocs(qOrders);
      const rSnap = await getDocs(qReturns);

      const combined: any[] = [];

      oSnap.forEach((doc) => {
        const d = doc.data();
        combined.push({
          id: doc.id,
          type: "order",
          text: `🛒 New Order - ${doc.id}`,
          time: d.createdAt?.seconds || Date.now() / 1000
        });
      });

      rSnap.forEach((doc) => {
        const d = doc.data();
        combined.push({
          id: doc.id,
          type: "return",
          text: `🔁 Return (${d.status}) - ${doc.id}`,
          time: d.createdAt?.seconds || Date.now() / 1000
        });
      });

      setAlerts(combined.sort((a, b) => b.time - a.time));
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  // 🔥 MAIN LISTENER
  useEffect(() => {
    if (!canPlay) return;

    const qOrders = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const qReturns = query(
      collection(db, "returns"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    // 🛒 ORDERS
    const unsubOrders = onSnapshot(qOrders, (snap) => {

      if (isFirstLoad) {
        lastOrderCount.current = snap.size;
      } else if (snap.size > lastOrderCount.current) {
        playSound();
      }

      lastOrderCount.current = snap.size;

      updateData(qOrders, qReturns);
      setIsFirstLoad(false);
    });

    // 🔁 RETURNS
    const unsubReturns = onSnapshot(qReturns, (snap) => {

      if (isFirstLoad) {
        lastReturnCount.current = snap.size;
      } else if (snap.size > lastReturnCount.current) {
        playSound();
      }

      lastReturnCount.current = snap.size;

      updateData(qOrders, qReturns);
      setIsFirstLoad(false);
    });

    return () => {
      unsubOrders();
      unsubReturns();
    };

  }, [canPlay]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">

      {/* 🔒 SOUND ENABLE SCREEN */}
      {!canPlay && (
        <div className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-3xl text-center max-w-sm w-full shadow-2xl">

            <div className="text-4xl mb-4">🔔</div>

            <h2 className="text-xl font-bold mb-2">
              Enable Notifications
            </h2>

            <p className="text-gray-500 text-sm mb-6">
              Sound enable karne ke liye button dabao
            </p>

            <button
              onClick={() => {
                setCanPlay(true);
                playSound(); // first click unlock
              }}
              className="w-full bg-black text-white py-3 rounded-xl font-bold"
            >
              Start Monitoring
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-4">
        🔔 Live Alerts
      </h1>

      {/* FILTER */}
      <div className="flex gap-2 mb-4">
        {["ALL", "order", "return"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 rounded-xl ${
              filter === f
                ? "bg-black text-white"
                : "bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* LIST */}
      {alerts
        .filter((a) => filter === "ALL" || a.type === filter)
        .map((a, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl shadow mb-3 flex justify-between"
          >
            <p className="text-sm">{a.text}</p>
            <span className="text-xs text-gray-400">
              {new Date(a.time * 1000).toLocaleTimeString()}
            </span>
          </div>
        ))}

    </div>
  );
}

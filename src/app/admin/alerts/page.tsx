"use client";

import { useEffect, useRef,创新, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [canPlay, setCanPlay] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const lastOrderCount = useRef(0);
  const lastReturnCount = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🔔 SOUND SETUP (Audio object ko pehle hi load kar lo)
  useEffect(() => {
    audioRef.current = new Audio("/notify.mp3");
    audioRef.current.load();
  }, []);

  const playSound = () => {
    if (canPlay && audioRef.current) {
      audioRef.current.currentTime = 0; // Reset to start
      audioRef.current.play().catch((err) => console.log("Sound error:", err));
    }
  };

  useEffect(() => {
    if (!canPlay) return;

    // ================= LISTEN TO ORDERS =================
    const qOrders = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(20));
    const unsubOrders = onSnapshot(qOrders, (snap) => {
      if (isFirstLoad) {
        lastOrderCount.current = snap.size;
      } else if (snap.size > lastOrderCount.current) {
        playSound();
        lastOrderCount.current = snap.size;
      }

      updateData();
    });

    // ================= LISTEN TO RETURNS =================
    const qReturns = query(collection(db, "returns"), orderBy("createdAt", "desc"), limit(20));
    const unsubReturns = onSnapshot(qReturns, (snap) => {
      if (isFirstLoad) {
        lastReturnCount.current = snap.size;
      } else if (snap.size > lastReturnCount.current) {
        playSound();
        lastReturnCount.current = snap.size;
      }

      updateData();
    });

    const updateData = async () => {
      const oSnap = await getDocs(qOrders);
      const rSnap = await getDocs(qReturns);

      const combined: any[] = [];
      oSnap.forEach(doc => combined.push({ id: doc.id, type: 'order', text: `🛒 New Order - ${doc.id}`, time: doc.data().createdAt?.seconds || Date.now()/1000 }));
      rSnap.forEach(doc => combined.push({ id: doc.id, type: 'return', text: `🔁 Return Request - ${doc.id}`, time: doc.data().createdAt?.seconds || Date.now()/1000 }));

      setAlerts(combined.sort((a, b) => b.time - a.time));
      setIsFirstLoad(false);
    };

    return () => {
      unsubOrders();
      unsubReturns();
    };
  }, [canPlay, isFirstLoad]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* 🛑 BLOCKER OVERLAY: Jab tak click nahi karega, sound enable nahi hoga */}
      {!canPlay && (
        <div className="fixed inset-0 bg-black/90 z-[999] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl">
            <div className="text-6-xl mb-4 text-4xl">🔔</div>
            <h2 className="text-2xl font-black mb-2 uppercase">System Ready</h2>
            <p className="text-gray-500 text-sm mb-6">Live notifications aur bell sound enable karne ke liye niche button dabayein.</p>
            <button
              onClick={() => {
                setCanPlay(true);
                playSound(); // Ek baar play karna zaroori hai browser permission ke liye
              }}
              className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
            >
              Start Monitoring
            </button>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black uppercase italic">Live Alerts</h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Live</span>
          </div>
        </div>

        {/* FILTER */}
        <div className="flex gap-2 mb-6">
          {["ALL", "order", "return"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all ${
                filter === f ? "bg-black text-white shadow-lg" : "bg-white text-gray-400 border border-gray-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="space-y-3">
          {alerts
            .filter(a => filter === "ALL" || a.type === filter)
            .map((a, i) => (
              <div key={i} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-50 flex justify-between items-center animate-in slide-in-from-bottom-2">
                <div>
                  <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{a.text}</p>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">
                    {new Date(a.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className={`w-2 h-2 rounded-full ${a.type === 'order' ? 'bg-blue-400' : 'bg-orange-400'}`}></div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

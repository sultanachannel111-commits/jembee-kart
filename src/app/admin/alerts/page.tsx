"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { Bell, ShoppingCart, RefreshCcw, Volume2 } from "lucide-react";

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [canPlay, setCanPlay] = useState(false);
  
  // Ref to track if it's the very first data fetch from Firebase
  const isInitialLoad = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🔔 AUDIO LOAD
  useEffect(() => {
    audioRef.current = new Audio("/notify.mp3"); // Ensure file is in public folder
    audioRef.current.load();
  }, []);

  // 🔔 PLAY SOUND
  const playSound = () => {
    if (!canPlay || !audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(e => console.log("Playback error:", e));
  };

  // 🔥 MAIN LISTENER
  useEffect(() => {
    if (!canPlay) return;

    const qCombined = query(
      collection(db, "notifications"), // Best practice: Ek notifications collection rakho
      orderBy("createdAt", "desc"),
      limit(30)
    );

    const unsub = onSnapshot(qCombined, (snap) => {
      const newAlerts = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 🚨 SOUND LOGIC: Agar naya document add hua hai aur ye pehla load nahi hai
      if (!isInitialLoad.current && snap.docChanges().some(change => change.type === "added")) {
        playSound();
      }

      setAlerts(newAlerts);
      isInitialLoad.current = false;
    });

    return () => unsub();
  }, [canPlay]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24">
      
      {/* 🔒 SOUND UNLOCK OVERLAY */}
      {!canPlay && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[999] flex items-center justify-center p-6">
          <div className="bg-white p-10 rounded-[40px] text-center max-w-sm w-full shadow-2xl border-4 border-purple-100">
            <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Bell className="text-purple-600 animate-bounce" size={40} />
            </div>
            <h2 className="text-2xl font-black italic tracking-tighter mb-2">LIVE TERMINAL</h2>
            <p className="text-slate-500 text-sm font-bold mb-8 uppercase tracking-widest">Enable sound for real-time order alerts</p>
            <button
              onClick={() => { setCanPlay(true); playSound(); }}
              className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-tighter shadow-xl shadow-purple-200 active:scale-95 transition-all"
            >
              Start Monitoring
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black italic tracking-tighter">NOTIFICATIONS</h1>
        <div className="bg-green-100 text-green-600 px-4 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live Connection
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        {["ALL", "order", "return"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
              filter === f ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {alerts
          .filter((a) => filter === "ALL" || a.type === filter)
          .map((a) => (
            <div
              key={a.id}
              className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 group hover:shadow-md transition-all"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                a.type === 'order' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
              }`}>
                {a.type === 'order' ? <ShoppingCart size={20} /> : <RefreshCcw size={20} />}
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{a.message || a.text}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  ID: {a.id.slice(-8)}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-black text-slate-300 uppercase">
                  {a.createdAt?.toDate ? a.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Now"}
                </span>
              </div>
            </div>
          ))}
          
          {alerts.length === 0 && (
            <div className="text-center py-20 text-slate-300 font-bold uppercase text-xs tracking-widest">
              Waiting for new alerts...
            </div>
          )}
      </div>
    </div>
  );
}

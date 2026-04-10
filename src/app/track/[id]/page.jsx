"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function TrackPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "orders", id), (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      }
    });
    return () => unsub();
  }, [id]);

  if (!order) return (
    <div className="h-screen flex items-center justify-center bg-[#0f172a]">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  );

  const steps = ["Pending", "Placed", "Shipped", "Out for Delivery", "Delivered"];
  const current = steps.indexOf(order.status || "Pending");
  const progress = current <= 0 ? 5 : current >= steps.length - 1 ? 100 : (current / (steps.length - 1)) * 100;

  let deliveryDate = "N/A";
  if (order.createdAt?.toDate) {
    const d = order.createdAt.toDate();
    d.setDate(d.getDate() + 5);
    deliveryDate = d.toDateString();
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f172a] font-sans p-4 pb-10">
      
      {/* 🌌 Animated Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>

      <div className="max-w-md mx-auto relative z-10 space-y-6">
        
        {/* 🎫 HEADER CARD */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-[2.5rem] shadow-2xl text-center">
          <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Live Tracking</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-1 italic">Order Active</h1>
          <p className="text-[10px] font-mono text-white/30 mb-6 uppercase tracking-widest">Hash: {order.id.slice(0, 12)}</p>
          
          <div className="bg-gradient-to-tr from-white/20 to-white/5 p-[1px] rounded-3xl inline-block">
            <div className="bg-[#1e293b]/80 backdrop-blur-md px-8 py-4 rounded-3xl">
               <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                 ₹{order.total || 0}
               </p>
            </div>
          </div>
        </div>

        {/* 🚚 PROGRESS LOADER */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-[2.5rem] shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-blue-400 tracking-tighter">Status</span>
              <span className="text-xl font-black text-white uppercase italic tracking-tighter">{order.status || "Pending"}</span>
            </div>
            <div className="text-right">
               <span className="text-[10px] font-black uppercase text-white/40 tracking-tighter">ETA</span>
               <span className="block text-xs font-bold text-white/80 uppercase">{deliveryDate}</span>
            </div>
          </div>

          <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mb-8 border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(59,130,246,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-5 gap-1">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full mb-3 shadow-lg transition-all duration-500 ${i <= current ? 'bg-blue-400 scale-125 shadow-blue-500/50' : 'bg-white/10'}`} />
                <p className={`text-[7px] font-black uppercase text-center tracking-tighter leading-none ${i <= current ? 'text-white' : 'text-white/20'}`}>
                  {s}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 🛒 ITEM ROSTER */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-[2.5rem] shadow-xl">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-6">Package Contents</h2>
          <div className="space-y-6">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-5 group">
                <div className="relative">
                  <img
                    src={item.image || "/placeholder.png"}
                    className="w-16 h-16 rounded-[1.5rem] object-cover border border-white/10 group-hover:scale-105 transition-transform"
                    alt={item.name}
                  />
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center text-white border-2 border-[#0f172a]">
                    {item.qty}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-white uppercase tracking-tight leading-tight mb-1">{item.name}</p>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest italic">Confined Pack</p>
                </div>
                <p className="font-black text-white text-sm tracking-tighter">₹{item.price * item.qty}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 💳 INVOICE SUMMARY */}
        <div className="backdrop-blur-xl bg-gradient-to-b from-white/10 to-transparent border border-white/20 p-8 rounded-[2.5rem] shadow-2xl">
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-black uppercase text-white/40 tracking-[0.1em]">
              <span>Cart Subtotal</span>
              <span className="text-white">₹{order.itemsTotal || (order.total - (order.shipping || 0))}</span>
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase text-white/40 tracking-[0.1em]">
              <span>Logistics Fee</span>
              <span className="text-white">₹{order.shipping || 0}</span>
            </div>
            <div className="pt-5 mt-2 border-t border-white/10 flex justify-between items-center">
              <div>
                <span className="block text-[10px] font-black uppercase text-blue-400 tracking-widest mb-1 text-left">Payable Amount</span>
                <span className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Total Value</span>
              </div>
              <span className="text-3xl font-black text-white tracking-tighter leading-none">₹{order.total}</span>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] font-black text-white/20 uppercase tracking-[0.4em] pt-4">
          Verified by Jembee Secure
        </p>

      </div>

      {/* Tailwind Glassmorphism Style injection */}
      <style jsx global>{`
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}

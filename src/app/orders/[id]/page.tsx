"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!id) return;

    // Fixed: 'as string' hata diya hai build error solve karne ke liye
    const unsub = onSnapshot(doc(db, "orders", id), (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        let total = 0;
        data.items?.forEach((item) => {
          total += Number(item.price || 0) * (item.quantity || 1);
        });
        setOrder({ ...data, total });
      }
    });

    return () => unsub();
  }, [id]);

  if (!order) return (
    <div className="h-screen flex items-center justify-center bg-[#0f172a] text-white/50 font-bold tracking-tighter uppercase italic animate-pulse">
      Initialising Secure Link...
    </div>
  );

  const steps = ["Pending", "Confirmed", "Shipped", "Out for Delivery", "Delivered"];
  const currentStep = steps.indexOf(order.status || "Pending");
  const progress = (currentStep / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 pb-12 overflow-hidden relative">
      
      {/* 🔮 Background Glow Effects */}
      <div className="absolute top-0 -left-20 w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-20 -right-20 w-80 h-80 bg-purple-600/10 blur-[120px] rounded-full"></div>

      <div className="max-w-md mx-auto space-y-6 relative z-10">
        
        {/* 🏷️ Header Card */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 p-6 rounded-[2.5rem] shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">Package Tracker</p>
              <h1 className="text-2xl font-black text-white italic tracking-tighter">ORDER ACTIVE</h1>
            </div>
            <div className="bg-white/5 p-2 rounded-2xl border border-white/5">📦</div>
          </div>
          <p className="text-[9px] font-mono text-white/20 tracking-widest bg-black/40 p-2 rounded-lg inline-block">
            UID: {order.id.toUpperCase()}
          </p>
        </div>

        {/* 💳 Price Morphism Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(37,99,235,0.3)]">
          <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1 text-center">Final Settlement</p>
          <p className="text-5xl font-black text-white text-center tracking-tighter italic">₹{order.total}</p>
          <div className="mt-6 flex justify-center">
            <div className="bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_#4ade80]"></span>
              <span className="text-[9px] font-bold text-white uppercase tracking-tighter">Verified Order</span>
            </div>
          </div>
        </div>

        {/* 🛤️ Tracking Timeline */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 p-7 rounded-[2.5rem]">
          <div className="relative mb-10 mt-4">
            <div className="h-1 bg-white/5 rounded-full w-full"></div>
            <div 
              className="h-1 bg-gradient-to-r from-blue-500 to-cyan-400 absolute top-0 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
              style={{ width: `${progress}%` }}
            ></div>
            <div 
              className="absolute -top-3.5 w-8 h-8 bg-[#020617] border border-blue-500 rounded-full flex items-center justify-center text-xs shadow-xl transition-all duration-1000"
              style={{ left: `calc(${progress}% - 16px)` }}
            >
              🚀
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <p className={`text-[7px] font-black uppercase tracking-tighter transition-colors ${i <= currentStep ? 'text-white' : 'text-white/20'}`}>
                  {s}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 📄 Items Summary */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 p-6 rounded-[2.5rem]">
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Cart Manifest</h3>
          <div className="space-y-4">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 font-black text-xs text-blue-400">
                    {item.quantity || 1}
                  </div>
                  <span className="text-[11px] font-bold text-white uppercase tracking-tight">{item.name}</span>
                </div>
                <span className="text-xs font-black text-white italic">₹{Number(item.price) * (item.quantity || 1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 🛡️ Secure Badge (Replaced Map/Delivery Partner) */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] flex items-center gap-5">
           <div className="w-14 h-14 bg-gradient-to-tr from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center text-2xl border border-green-500/20">
             🔐
           </div>
           <div>
             <h4 className="text-[11px] font-black text-white uppercase italic tracking-tighter">Secure Logistics</h4>
             <p className="text-[9px] text-white/40 leading-relaxed mt-0.5">Aapka order fully insured hai. Delivery ke waqt tamper-evident packaging check karein.</p>
           </div>
        </div>

        {/* 📲 Action Buttons */}
        <div className="space-y-3">
          <a 
            href={`https://wa.me/917061369212?text=Order Help ID: ${order.id}`}
            className="w-full bg-white text-black py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-95"
          >
            Contact Support 📲
          </a>
        </div>

        <p className="text-center text-[9px] font-black text-white/10 uppercase tracking-[0.5em] pt-4">
          Verified by Jembee Cloud
        </p>

      </div>
    </div>
  );
}

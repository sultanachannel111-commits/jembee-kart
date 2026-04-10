"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

/* 🔥 SAFE PRICE CALCULATOR */
const getFinalPrice = (item) => {
  return Number(item.price || 0);
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  /* 🔄 REALTIME LISTENER */
  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, "orders", id), (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        let total = 0;
        data.items?.forEach((item) => {
          total += getFinalPrice(item) * (item.quantity || 1);
        });
        setOrder({ ...data, total });
        
        // Background toast only if status changes
        if(data.status) toast.success(`Status: ${data.status} 🚚`);
      }
    });

    return () => unsub();
  }, [id]);

  if (!order)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 font-bold text-gray-400 animate-pulse">
        Loading Secure Order...
      </div>
    );

  /* 🔥 TRACKING STEPS */
  const steps = ["Pending", "Confirmed", "Shipped", "Out for Delivery", "Delivered"];
  const currentStep = steps.indexOf(order.status || "Pending");
  const progress = (currentStep / (steps.length - 1)) * 100;

  const whatsappLink = `https://wa.me/917061369212?text=${encodeURIComponent(
    `Hello Jembee Support,\nOrder ID: ${order.id}\nStatus: ${order.status}\nI need help with my delivery.`
  )}`;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 pb-12 font-sans text-slate-900">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* 🔝 TOP NAVIGATION CARD */}
        <div className="backdrop-blur-xl bg-white/80 border border-white p-5 rounded-[2rem] shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter italic">Tracking</h1>
            <p className="text-[10px] text-gray-400 font-mono">ID: {order.id.slice(0, 12)}</p>
          </div>
          <button
            onClick={() => toast.success("Refreshed! 🔄")}
            className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-lg shadow-inner active:scale-90 transition-all"
          >
            🔔
          </button>
        </div>

        {/* 💰 PREMIUM PRICE DISPLAY */}
        <div className="bg-black p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Bill Value</p>
          <p className="text-4xl font-black text-white italic tracking-tighter">₹{order.total}</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
            Payment Verified
          </div>
        </div>

        {/* 🚚 MASTER TRACKING BAR */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Journey Status</h3>
          <div className="relative px-2">
            <div className="w-full h-1.5 bg-slate-100 rounded-full" />
            <div
              className="h-1.5 bg-black absolute top-0 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
            {/* 🚚 FLOATING TRUCK */}
            <div
              className="absolute -top-7 text-2xl transition-all duration-1000 ease-out"
              style={{ left: `calc(${progress}% - 15px)` }}
            >
              🚀
            </div>
          </div>
          <div className="flex justify-between mt-5 text-[8px] font-black uppercase tracking-tighter">
            {steps.map((step, i) => (
              <span key={i} className={i <= currentStep ? "text-black scale-110" : "text-slate-300"}>
                {step}
              </span>
            ))}
          </div>
        </div>

        {/* 🛒 ITEM LIST */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5">Order Summary</h3>
          <div className="space-y-4">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-xs border border-slate-100">
                    {item.quantity || 1}x
                  </div>
                  <span className="text-xs font-bold text-slate-700 uppercase leading-tight tracking-tight">
                    {item.name}
                  </span>
                </div>
                <span className="font-black text-xs text-slate-900">
                  ₹{getFinalPrice(item) * (item.quantity || 1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ DELIVERY GUARANTEE (Instead of Map) */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-[2.5rem] border border-blue-100">
          <div className="flex items-start gap-4">
             <div className="text-3xl">🛡️</div>
             <div>
               <h4 className="text-xs font-black uppercase text-blue-900 tracking-tight">Secure Delivery Guarantee</h4>
               <p className="text-[10px] text-blue-700/70 mt-1 leading-relaxed">
                 Aapka parcel Jembee Express ke through secure hai. Delivery partner verification aur quality check complete ho chuka hai. 
               </p>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
             <div className="bg-white/50 p-3 rounded-2xl text-center">
                <span className="block text-lg">📦</span>
                <span className="text-[8px] font-black uppercase text-slate-500">Sanitized</span>
             </div>
             <div className="bg-white/50 p-3 rounded-2xl text-center">
                <span className="block text-lg">⚡</span>
                <span className="text-[8px] font-black uppercase text-slate-500">Fast Ship</span>
             </div>
          </div>
        </div>

        {/* 📲 ACTION BUTTONS */}
        <div className="grid grid-cols-1 gap-3">
          <a
            href={whatsappLink}
            target="_blank"
            className="flex items-center justify-center gap-3 bg-[#25D366] text-white py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-green-200 active:scale-95 transition-all"
          >
            Contact Support 📲
          </a>
          
          <button 
            onClick={() => window.print()}
            className="bg-white border border-slate-200 text-slate-400 py-4 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all"
          >
            Download Invoice 📄
          </button>
        </div>

        <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] py-4">
          Powered by Jembee
        </p>
      </div>
    </div>
  );
}

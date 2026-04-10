"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function TrackPage() {
  const params = useParams();
  const id = params?.id;

  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    // Real-time tracking using onSnapshot
    const unsub = onSnapshot(doc(db, "orders", id as string), (snap) => {
      if (snap.exists()) {
        setOrder({
          id: snap.id,
          ...snap.data()
        });
      }
    });

    return () => unsub();
  }, [id]);

  if (!order) {
    return (
      <div className="h-screen flex items-center justify-center font-bold text-blue-600 animate-pulse">
        Loading Order Details...
      </div>
    );
  }

  // 🔥 TRACKING STEPS (Matching Firestore Logic)
  const steps = [
    "PENDING",
    "CONFIRMED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED"
  ];

  const currentStatus = order.status || "PENDING";
  const currentIndex = Math.max(steps.indexOf(currentStatus), 0);

  // Calculate Progress Bar Width
  const progress =
    currentIndex <= 0
      ? 5
      : currentIndex >= steps.length - 1
      ? 100
      : (currentIndex / (steps.length - 1)) * 100;

  // 🎨 DYNAMIC STEP COLORING
  const getStepColor = (step: string, index: number) => {
    if (index > currentIndex) return "text-gray-300";

    switch (step) {
      case "PENDING": return "text-yellow-500";
      case "CONFIRMED": return "text-blue-500";
      case "SHIPPED": return "text-purple-500";
      case "OUT_FOR_DELIVERY": return "text-orange-500";
      case "DELIVERED": return "text-green-600";
      default: return "text-black";
    }
  };

  const getBarColor = () => {
    switch (currentStatus) {
      case "PENDING": return "bg-yellow-500";
      case "CONFIRMED": return "bg-blue-500";
      case "SHIPPED": return "bg-purple-500";
      case "OUT_FOR_DELIVERY": return "bg-orange-500";
      case "DELIVERED": return "bg-green-600";
      default: return "bg-black";
    }
  };

  // 📅 SAFE DELIVERY DATE CALCULATION
  let deliveryDate = "Checking...";
  if (order.createdAt) {
    // Check if it's a Firestore Timestamp or a String
    const dateObj = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
    dateObj.setDate(dateObj.getDate() + 5); // Estimated 5 days
    deliveryDate = dateObj.toDateString();
  }

  // 🔤 FORMATTING STATUS TEXT
  const formatStatus = (s: string) =>
    s?.toLowerCase()
     .replaceAll("_", " ")
     .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-16">
      <div className="max-w-md mx-auto space-y-6">

        {/* --- HEADER --- */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm text-center border border-slate-100">
          <h1 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">
            Order Tracking
          </h1>
          <p className="text-[10px] text-slate-300 font-mono mb-6">
            #{order.id.toUpperCase()}
          </p>
          <div className="inline-block bg-green-50 px-6 py-2 rounded-2xl">
             <p className="text-3xl font-black text-green-600">
               ₹{order.total || 0}
             </p>
          </div>
        </div>

        {/* --- ORDER ITEMS --- */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-5">
            Your Package
          </h2>
          <div className="space-y-5">
            {order.items?.map((item: any, i: number) => {
              const qty = item.qty || item.quantity || 1;
              return (
                <div key={i} className="flex gap-4 items-center">
                  <div className="relative">
                    <img
                      src={item.image || "/placeholder.png"}
                      className="w-16 h-16 rounded-2xl object-cover shadow-sm"
                    />
                    <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">
                      {qty}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-800 line-clamp-1">{item.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      Size: {item.size || "Standard"}
                    </p>
                  </div>
                  <p className="font-black text-slate-900">₹{item.price * qty}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- TRACKING VISUALIZER --- */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
              <p className="text-lg font-black text-slate-900">
                {formatStatus(currentStatus)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Expected</p>
              <p className="text-sm font-bold text-slate-800">{deliveryDate}</p>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="relative h-2 bg-slate-100 rounded-full mb-6">
            <div
              className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-1000 ease-out ${getBarColor()}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* STEPS TEXT */}
          <div className="grid grid-cols-5 gap-1">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full mb-2 ${i <= currentIndex ? getBarColor() : 'bg-slate-200'}`} />
                <span className={`text-[8px] font-black leading-tight tracking-tighter uppercase ${getStepColor(s, i)}`}>
                  {formatStatus(s).split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* --- BILLING SUMMARY --- */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-3">
          <div className="flex justify-between text-xs font-bold text-slate-500">
            <span>Subtotal</span>
            <span>₹{order.total - (order.shipping || 0)}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-slate-500">
            <span>Shipping</span>
            <span className={order.shipping === 0 ? "text-green-600" : ""}>
              {order.shipping === 0 ? "FREE" : `₹${order.shipping}`}
            </span>
          </div>
          <div className="pt-3 border-t border-dashed flex justify-between items-center">
            <span className="text-sm font-black text-slate-900 uppercase">Grand Total</span>
            <span className="text-xl font-black text-blue-600">₹{order.total}</span>
          </div>
        </div>

        {/* BACK TO SHOPPING */}
        <button 
          onClick={() => window.location.href = "/"}
          className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
        >
          Continue Shopping
        </button>

      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { 
  ArrowLeft, Package, Truck, CheckCircle2, MapPin, 
  Clock, ChevronRight, Loader2, Phone, ExternalLink 
} from "lucide-react";

export default function TrackOrderPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, "orders", id as string), (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });

    return () => unsub();
  }, [id]);

  const steps = [
    { label: "Order Placed", status: "PLACED", icon: <Clock size={16}/> },
    { label: "Processing", status: "READY_FOR_MANUAL_QIKINK", icon: <Package size={16}/> },
    { label: "Shipped", status: "SHIPPED", icon: <Truck size={16}/> },
    { label: "Delivered", status: "DELIVERED", icon: <CheckCircle2 size={16}/> },
  ];

  const getActiveStep = () => {
    const currentStatus = order?.orderStatus;
    // Qikink statuses handle karne ke liye extra check
    if (currentStatus === "CANCELLED") return -1;
    return steps.findIndex(step => step.status === currentStatus);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-slate-900" size={32} />
    </div>
  );

  if (!order) return (
    <div className="h-screen flex flex-col items-center justify-center p-10 text-center">
      <h1 className="text-xl font-black italic">Order Not Found</h1>
      <button onClick={() => router.push("/orders")} className="mt-4 text-indigo-600 font-bold uppercase text-[10px]">Back</button>
    </div>
  );

  const activeIndex = getActiveStep();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="p-8 rounded-b-[45px] shadow-2xl relative bg-black">
        <button onClick={() => router.back()} className="absolute left-6 top-9 text-white/70">
          <ArrowLeft size={24}/>
        </button>
        <h1 className="text-xl font-black text-white text-center italic uppercase tracking-widest">Track Order</h1>
      </div>

      <div className="max-w-md mx-auto px-5 -mt-8 space-y-5">
        
        {/* 🚚 QIKINK LIVE TRACKING LINK CARD */}
        {order.tracking_url && (
          <div className="bg-indigo-600 p-6 rounded-[35px] shadow-xl text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Live Courier Tracking</p>
                <p className="text-sm font-bold mt-1">ID: {order.tracking_number || "Awaiting..."}</p>
              </div>
              <a 
                href={order.tracking_url} 
                target="_blank" 
                className="bg-white text-indigo-600 p-3 rounded-2xl shadow-lg active:scale-90 transition-all"
              >
                <ExternalLink size={20} />
              </a>
            </div>
          </div>
        )}

        <div className="bg-white p-8 rounded-[40px] shadow-xl border border-white">
          <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
            <h2 className="text-[10px] font-black uppercase tracking-[2px] text-slate-400">Current Status</h2>
            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
              order.orderStatus === "CANCELLED" ? "bg-red-50 text-red-500 border-red-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
            }`}>
              {order.orderStatus?.replace(/_/g, " ")}
            </span>
          </div>

          <div className="space-y-10 relative">
            <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-slate-100 -z-0"></div>
            
            {steps.map((step, idx) => {
              const isCompleted = idx <= activeIndex;
              const isCurrent = idx === activeIndex;

              return (
                <div key={idx} className="flex items-start gap-6 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
                    isCompleted ? "bg-black text-white scale-110" : "bg-white text-slate-300 border-2 border-slate-100"
                  }`}>
                    {isCompleted ? <CheckCircle2 size={16} /> : step.icon}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={`text-[11px] font-black uppercase tracking-tight ${isCompleted ? "text-slate-900" : "text-slate-300"}`}>
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SHIPPING ADDRESS */}
        <div className="bg-white p-6 rounded-[35px] shadow-lg border border-white">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={14} className="text-slate-300" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-bold">Shipping To</span>
          </div>
          <p className="text-xs font-black text-slate-800 uppercase italic">{order.address?.name}</p>
          <p className="text-[10px] text-slate-500 font-bold leading-relaxed mt-2 uppercase">
            {order.address?.street}, {order.address?.city}, {order.address?.pincode}
          </p>
        </div>

        {/* PACKAGE CONTENTS */}
        <div className="bg-white p-6 rounded-[35px] shadow-lg border border-white">
          <div className="flex items-center gap-2 mb-4">
            <Package size={14} className="text-slate-300" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-bold">Package</span>
          </div>
          {order.items?.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-2xl mb-2">
              <img src={item.image} className="w-10 h-10 rounded-xl object-cover" alt="" />
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-800 uppercase italic">{item.name}</p>
                <p className="text-[9px] text-slate-400 font-bold">QTY: {item.qty}</p>
              </div>
            </div>
          ))}
        </div>

        {/* SUPPORT */}
        <a href="https://wa.me/917061369212" className="flex items-center justify-between w-full bg-green-50 p-6 rounded-[35px] border border-green-100 transition-all active:scale-95">
          <div className="flex items-center gap-4">
            <div className="bg-green-500 p-3 rounded-2xl text-white">
              <Phone size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-green-900 uppercase italic">Support Chat</p>
              <p className="text-[9px] text-green-600/70 font-bold uppercase tracking-widest">Connect with Jembee</p>
            </div>
          </div>
          <ChevronRight className="text-green-300" />
        </a>

      </div>
      <p className="mt-12 text-center text-[8px] font-black text-slate-200 uppercase tracking-[8px] italic">Design by Sadiya</p>
    </div>
  );
}

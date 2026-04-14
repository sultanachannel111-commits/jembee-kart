"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { 
  ArrowLeft, Package, Truck, CheckCircle2, MapPin, 
  Clock, ChevronRight, Loader2, Phone, ExternalLink, ShieldCheck, AlertCircle 
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

  // Qikink Standard Workflow Steps
  const steps = [
    { label: "Order Placed", status: "PLACED", icon: <Clock size={16}/> },
    { label: "Processing", status: "READY_FOR_MANUAL_QIKINK", icon: <Package size={16}/> },
    { label: "In Production", status: "PRINTING", icon: <ShieldCheck size={16}/> },
    { label: "Shipped", status: "SHIPPED", icon: <Truck size={16}/> },
    { label: "Delivered", status: "DELIVERED", icon: <CheckCircle2 size={16}/> },
  ];

  const getActiveStep = () => {
    const currentStatus = order?.orderStatus;
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
      <h1 className="text-xl font-black italic uppercase">Order Not Found</h1>
      <button onClick={() => router.push("/orders")} className="mt-4 text-indigo-600 font-bold uppercase text-[10px] tracking-widest">Back to History</button>
    </div>
  );

  const activeIndex = getActiveStep();
  const isCancelled = order.orderStatus === "CANCELLED";

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* 📱 HEADER */}
      <div className="p-8 rounded-b-[45px] shadow-2xl relative bg-black">
        <button onClick={() => router.back()} className="absolute left-6 top-9 text-white/70 active:scale-90 transition-all">
          <ArrowLeft size={24}/>
        </button>
        <h1 className="text-xl font-black text-white text-center italic uppercase tracking-widest">Live Tracking</h1>
      </div>

      <div className="max-w-md mx-auto px-5 -mt-8 space-y-5">
        
        {/* ❌ CANCELLED STATUS CARD */}
        {isCancelled && (
          <div className="bg-red-50 p-6 rounded-[35px] border border-red-100 flex items-center gap-4">
            <div className="bg-red-500 p-3 rounded-2xl text-white">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-red-900 uppercase italic">Order Cancelled</p>
              <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest">This order was not processed.</p>
            </div>
          </div>
        )}

        {/* 🚀 QIKINK SHIPPING CARD */}
        {!isCancelled && (order.orderStatus === "SHIPPED" || order.tracking_number) && (
          <div className="bg-indigo-600 p-6 rounded-[35px] shadow-xl text-white animate-in slide-in-from-top-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Courier: {order.courier_name || "Qikink Logistics"}</p>
                <p className="text-sm font-bold mt-1 tracking-tight">AWB: {order.tracking_number || "Updating..."}</p>
              </div>
              {order.tracking_url && (
                <a href={order.tracking_url} target="_blank" className="bg-white text-indigo-600 p-3 rounded-2xl shadow-lg hover:scale-105 active:scale-90 transition-all">
                  <ExternalLink size={20} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* 📊 STEPPER CARD */}
        {!isCancelled && (
          <div className="bg-white p-8 rounded-[40px] shadow-xl border border-white">
            <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
              <h2 className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 font-bold">Process State</h2>
              <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-indigo-50 text-indigo-600 border-indigo-100">
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
                      {isCurrent && <p className="text-[8px] text-indigo-500 font-black uppercase mt-1 italic animate-pulse">Live Update</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 📍 ADDRESS & ITEMS SUMMARY */}
        <div className="bg-white p-6 rounded-[35px] shadow-lg border border-white divide-y divide-slate-50">
          <div className="pb-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={14} className="text-slate-300" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-bold">Delivery To</span>
            </div>
            <p className="text-xs font-black text-slate-800 uppercase italic">{order.address?.name}</p>
            <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase leading-tight">
              {order.address?.street}, {order.address?.city} - {order.address?.pincode}
            </p>
          </div>
          
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Package size={14} className="text-slate-300" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-bold">Order Summary</span>
            </div>
            {order.items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center mb-1">
                <p className="text-[10px] font-bold text-slate-600 uppercase">{item.name} x {item.qty}</p>
                <p className="text-[10px] font-black text-slate-900">₹{item.price * item.qty}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 💬 HELP */}
        <a href="https://wa.me/917061369212" className="flex items-center justify-between w-full bg-slate-900 p-6 rounded-[35px] shadow-xl active:scale-95 transition-all">
          <div className="flex items-center gap-4 text-white">
            <Phone size={18} />
            <div>
              <p className="text-xs font-black uppercase italic">Contact Jembee</p>
              <p className="text-[8px] text-white/50 font-bold uppercase tracking-[2px]">Support available 24/7</p>
            </div>
          </div>
          <ChevronRight className="text-white/30" size={18} />
        </a>

      </div>
      <p className="mt-12 text-center text-[8px] font-black text-slate-200 uppercase tracking-[8px] italic">Design by Sadiya</p>
    </div>
  );
}

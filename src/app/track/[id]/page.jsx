"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { Package, Truck, CheckCircle2, Clock, ArrowLeft, Loader2, MapPin } from "lucide-react";

export default function TrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, "orders", id), (docSnap) => {
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    });

    return () => unsub();
  }, [id]);

  const steps = [
    { label: "Order Placed", status: ["PLACED", "PENDING"], icon: <Clock size={20}/> },
    { label: "Processing", status: ["PROCESSING"], icon: <Package size={20}/> },
    { label: "Shipped", status: ["SHIPPED"], icon: <Truck size={20}/> },
    { label: "Delivered", status: ["DELIVERED"], icon: <CheckCircle2 size={20}/> },
  ];

  // Current status index nikalne ke liye
  const currentStatusIndex = steps.findIndex(step => 
    step.status.includes(order?.orderStatus?.toUpperCase())
  );

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-orange-500" size={32} />
      <p className="text-[10px] font-black uppercase mt-4 tracking-widest">Fetching Status...</p>
    </div>
  );

  if (!order) return (
    <div className="h-screen flex flex-col items-center justify-center p-10 text-center">
      <h1 className="text-xl font-black uppercase italic">Order Not Found</h1>
      <button onClick={() => router.push("/my-orders")} className="mt-4 text-orange-500 font-bold underline">Back to Orders</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-black p-8 rounded-b-[40px] shadow-xl relative">
        <button onClick={() => router.back()} className="absolute left-6 top-9 text-white/70">
          <ArrowLeft size={24}/>
        </button>
        <h1 className="text-xl font-black text-white text-center italic uppercase tracking-widest">Track Order</h1>
      </div>

      <div className="max-w-md mx-auto px-5 -mt-6">
        {/* Order Brief Card */}
        <div className="bg-white p-6 rounded-[30px] shadow-lg border border-slate-100 mb-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID: #{id.slice(-8)}</p>
            <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black">
              {order.orderStatus || "PENDING"}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden">
              <img src={order.items?.[0]?.image} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-black italic uppercase line-clamp-1">{order.items?.[0]?.name}</p>
              <p className="text-[10px] font-bold text-slate-400">Total Items: {order.items?.length}</p>
            </div>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white p-8 rounded-[40px] shadow-lg border border-slate-100 relative overflow-hidden">
          <h2 className="text-sm font-black uppercase italic mb-8 flex items-center gap-2">
            <MapPin size={16} className="text-orange-500" /> Delivery Status
          </h2>

          <div className="space-y-10 relative">
            {/* Vertical Line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-slate-100 -z-0"></div>

            {steps.map((step, index) => {
              const isActive = index <= currentStatusIndex;
              const isLastActive = index === currentStatusIndex;

              return (
                <div key={index} className="flex items-start gap-6 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isActive ? "bg-black text-white shadow-lg" : "bg-slate-100 text-slate-300"
                  } ${isLastActive ? "ring-4 ring-orange-100" : ""}`}>
                    {step.icon}
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase italic ${isActive ? "text-black" : "text-slate-300"}`}>
                      {step.label}
                    </p>
                    {isActive && (
                      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">
                        {isLastActive ? "Your order is currently here" : "Completed"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-6 bg-orange-500 rounded-[30px] text-white shadow-xl">
            <p className="text-[10px] font-black uppercase opacity-70 mb-1">Expected Delivery</p>
            <p className="text-lg font-black italic">5-7 Business Days</p>
            <p className="text-[9px] font-bold mt-2 opacity-80 uppercase tracking-tighter">Hum aapke order ko jaldi se jaldi pahunchane ki koshish kar rahe hain!</p>
        </div>
      </div>
    </div>
  );
}

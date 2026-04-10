"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function TrackPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, "orders", id as string), (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      }
    });

    return () => unsub();
  }, [id]);

  if (!order) return <div className="h-screen flex items-center justify-center font-bold">Loading Order...</div>;

  // 🔥 STATUS STEPS
  const steps = ["Pending", "Placed", "Shipped", "Out for Delivery", "Delivered"];
  const current = steps.indexOf(order.status || "Pending");

  const progress =
    current <= 0
      ? 5
      : current >= steps.length - 1
      ? 100
      : (current / (steps.length - 1)) * 100;

  // 🚚 DELIVERY DATE
  let deliveryDate = "N/A";
  if (order.createdAt?.toDate) {
    const d = order.createdAt.toDate();
    d.setDate(d.getDate() + 5);
    deliveryDate = d.toDateString();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-10 font-sans">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 text-center">
          <h1 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-2">Track Order</h1>
          <p className="text-xs font-mono text-gray-300 mb-4">ID: #{order.id.slice(0, 10)}</p>
          <div className="bg-green-50 inline-block px-4 py-2 rounded-full">
            <p className="text-2xl font-black text-green-600">₹{order.total || 0}</p>
          </div>
        </div>

        {/* 🛒 ITEMS LIST */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items?.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <img
                  src={item.image || "/placeholder.png"}
                  className="w-16 h-16 rounded-2xl object-cover border border-gray-50"
                  alt={item.name}
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800 uppercase leading-tight">{item.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Quantity: {item.qty}</p>
                </div>
                <p className="font-bold text-slate-800 text-sm">₹{item.price * item.qty}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 🚚 MODERN TRACKING BAR */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400">Current Status</p>
              <p className="text-lg font-black text-slate-800 uppercase italic tracking-tighter">
                {order.status || "Pending"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-gray-400">Expected By</p>
              <p className="text-xs font-bold text-slate-600 uppercase">{deliveryDate}</p>
            </div>
          </div>

          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-black transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-5 gap-1">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className={`h-1 mb-2 rounded-full ${i <= current ? 'bg-black' : 'bg-gray-200'}`} />
                <p className={`text-[8px] font-black uppercase tracking-tighter ${i <= current ? 'text-black' : 'text-gray-300'}`}>
                  {s}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 💰 BILLING BREAKDOWN */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-3">
          <div className="flex justify-between text-xs font-bold uppercase text-gray-400">
            <span>Items Subtotal</span>
            <span>₹{order.itemsTotal || (order.total - (order.shipping || 0))}</span>
          </div>
          <div className="flex justify-between text-xs font-bold uppercase text-gray-400">
            <span>Shipping Fee</span>
            <span>₹{order.shipping || 0}</span>
          </div>
          <div className="pt-3 border-t border-dashed flex justify-between items-center">
            <span className="text-sm font-black uppercase">Grand Total</span>
            <span className="text-lg font-black text-black">₹{order.total}</span>
          </div>
        </div>

        <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
          Thank you for shopping with Jembee
        </p>

      </div>
    </div>
  );
}

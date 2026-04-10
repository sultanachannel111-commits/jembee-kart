"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

type OrderItem = {
  name: string;
  image?: string;
  price: number;
  qty?: number;
  quantity?: number;
};

type OrderType = {
  id: string;
  status?: string;
  total?: number;
  shipping?: number;
  items?: OrderItem[];
  createdAt?: any;
};

export default function TrackPage() {

  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<OrderType | null>(null);

  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, "orders", id), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Omit<OrderType, "id">;

        setOrder({
          id: snap.id,
          ...data
        });
      }
    });

    return () => unsub();
  }, [id]);

  if (!order) {
    return (
      <div className="h-screen flex items-center justify-center font-bold">
        Loading Order...
      </div>
    );
  }

  // 🔥 FIXED STATUS (IMPORTANT)
  const steps = [
    "PENDING",
    "CONFIRMED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED"
  ];

  const current = Math.max(
    steps.indexOf((order.status || "PENDING").toUpperCase()),
    0
  );

  const progress =
    current <= 0
      ? 5
      : current >= steps.length - 1
      ? 100
      : (current / (steps.length - 1)) * 100;

  // 🎨 COLOR FIX
  const getColor = (step: string, i: number) => {
    if (i > current) return "text-gray-300";

    if (step === "PENDING") return "text-yellow-500";
    if (step === "CONFIRMED") return "text-blue-500";
    if (step === "SHIPPED") return "text-purple-500";
    if (step === "OUT_FOR_DELIVERY") return "text-orange-500";
    if (step === "DELIVERED") return "text-green-600";

    return "text-black";
  };

  const getBarColor = () => {
    const s = steps[current];

    if (s === "PENDING") return "bg-yellow-500";
    if (s === "CONFIRMED") return "bg-blue-500";
    if (s === "SHIPPED") return "bg-purple-500";
    if (s === "OUT_FOR_DELIVERY") return "bg-orange-500";
    if (s === "DELIVERED") return "bg-green-600";

    return "bg-black";
  };

  // 📅 DELIVERY DATE
  let deliveryDate = "N/A";
  if (order.createdAt?.toDate) {
    const d = order.createdAt.toDate();
    d.setDate(d.getDate() + 5);
    deliveryDate = d.toDateString();
  }

  // 🔤 FORMAT STATUS
  const formatStatus = (s?: string) =>
    s
      ?.toLowerCase()
      .replaceAll("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-10">

      <div className="max-w-md mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow text-center">
          <h1 className="text-sm font-black uppercase text-gray-400 mb-2">
            Track Order
          </h1>

          <p className="text-xs text-gray-300 mb-4">
            ID: #{order.id.slice(0, 10)}
          </p>

          <p className="text-2xl font-black text-green-600">
            ₹{order.total || 0}
          </p>
        </div>

        {/* ITEMS */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow">
          <h2 className="text-xs font-black uppercase text-gray-400 mb-4">
            Order Items
          </h2>

          <div className="space-y-4">
            {order.items?.map((item, i) => {
              const qty = item.qty || item.quantity || 1;

              return (
                <div key={i} className="flex gap-4 items-center">
                  <img
                    src={item.image || "/placeholder.png"}
                    className="w-16 h-16 rounded-xl object-cover"
                  />

                  <div className="flex-1">
                    <p className="font-bold text-sm">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty: {qty}</p>
                  </div>

                  <p className="font-bold">₹{item.price * qty}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* TRACK BAR */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow">

          <p className="text-sm font-bold mb-2">
            {formatStatus(order.status || "PENDING")}
          </p>

          <p className="text-xs text-gray-400 mb-4">
            Delivery by: {deliveryDate}
          </p>

          {/* BAR */}
          <div className="h-3 bg-gray-200 rounded-full mb-4">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${getBarColor()}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* STEPS */}
          <div className="grid grid-cols-5 text-[10px] text-center">
            {steps.map((s, i) => (
              <span key={i} className={`font-bold ${getColor(s, i)}`}>
                {formatStatus(s)}
              </span>
            ))}
          </div>

        </div>

        {/* BILL */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow space-y-2">

          <div className="flex justify-between text-xs">
            <span>Subtotal</span>
            <span>
              ₹{order.total ? order.total - (order.shipping || 0) : 0}
            </span>
          </div>

          <div className="flex justify-between text-xs">
            <span>Shipping</span>
            <span>₹{order.shipping || 0}</span>
          </div>

          <div className="flex justify-between font-bold pt-2 border-t">
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>

        </div>

      </div>
    </div>
  );
}

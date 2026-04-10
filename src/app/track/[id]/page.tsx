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

    const unsub = onSnapshot(
      doc(db, "orders", id),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Omit<OrderType, "id">;

          setOrder({
            id: snap.id,
            ...data
          });
        }
      }
    );

    return () => unsub();
  }, [id]);

  if (!order) {
    return (
      <div className="h-screen flex items-center justify-center font-bold">
        Loading Order...
      </div>
    );
  }

  // 🔥 STATUS
  const steps = ["Pending", "Placed", "Shipped", "Out for Delivery", "Delivered"];
  const current = steps.indexOf(order.status || "Pending");

  const progress =
    current <= 0
      ? 5
      : current >= steps.length - 1
      ? 100
      : (current / (steps.length - 1)) * 100;

  // 📅 DELIVERY DATE
  let deliveryDate = "N/A";
  if (order.createdAt?.toDate) {
    const d = order.createdAt.toDate();
    d.setDate(d.getDate() + 5);
    deliveryDate = d.toDateString();
  }

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
                    <p className="font-bold text-sm">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Qty: {qty}
                    </p>
                  </div>

                  <p className="font-bold">
                    ₹{item.price * qty}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* TRACK BAR */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow">

          <p className="text-sm font-bold mb-2">
            {order.status || "Pending"}
          </p>

          <p className="text-xs text-gray-400 mb-4">
            Delivery by: {deliveryDate}
          </p>

          <div className="h-3 bg-gray-200 rounded-full mb-4">
            <div
              className="h-3 bg-black rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-5 text-[10px]">
            {steps.map((s, i) => (
              <span
                key={i}
                className={i <= current ? "text-black font-bold" : "text-gray-300"}
              >
                {s}
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

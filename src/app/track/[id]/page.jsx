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

  if (!order) return <div className="p-5">Loading...</div>;

  // 🔥 STATUS STEPS (UPDATED ONLY UI)
  const steps = [
    "🕐 Pending",
    "📦 Placed",
    "🚚 Shipped",
    "🏃 Out for Delivery",
    "✅ Delivered"
  ];

  const rawSteps = ["Pending","Placed","Shipped","Out for Delivery","Delivered"];

  const current = rawSteps.indexOf(order.status || "Pending");

  const progress =
    current <= 0
      ? 5
      : current >= rawSteps.length - 1
      ? 100
      : (current / (rawSteps.length - 1)) * 100;

  // 🚚 DELIVERY DATE (same logic)
  let deliveryDate = "N/A";

  if (order.createdAt?.toDate) {
    const d = order.createdAt.toDate();
    d.setDate(d.getDate() + 5);
    deliveryDate = d.toDateString();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-white p-4">

      <div className="glass p-5 max-w-md mx-auto space-y-5">

        <h1 className="text-xl font-bold text-center">
          🚚 Order Tracking
        </h1>

        {/* 💰 TOTAL */}
        <div className="text-center">
          <p className="text-gray-500">Total Amount</p>
          <p className="text-3xl font-bold text-green-600">
            ₹{order.total || 0}
          </p>

          {/* 💳 PAYMENT METHOD */}
          <p className="text-sm text-gray-500 mt-1">
            Payment: {order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Paid"}
          </p>
        </div>

        {/* 🛒 ITEMS */}
        <div>
          <p className="font-semibold mb-2">Items</p>

          {order.items?.map((item: any, i: number) => (
            <div key={i} className="flex gap-3 mb-2">

              <img
                src={item.image}
                className="w-14 h-14 rounded-lg border"
              />

              <div className="text-sm flex-1">
                <p>{item.name}</p>
                <p className="text-gray-500">
                  Qty: {item.qty}
                </p>
              </div>

              <p className="text-green-600 font-semibold">
                ₹{item.price * item.qty}
              </p>

            </div>
          ))}

        </div>

        {/* 📍 ADDRESS (NEW ADD) */}
        {order.address && (
          <div className="text-sm bg-white/60 p-3 rounded-xl">
            <p className="font-semibold mb-1">Delivery Address 📍</p>
            <p>{order.address.name}</p>
            <p>{order.address.phone}</p>
            <p>
              {order.address.addressLine}, {order.address.city}, {order.address.state} - {order.address.pincode}
            </p>
          </div>
        )}

        {/* 🚚 TRACKING BAR */}
        <div className="mt-4">

          <div className="relative">

            <div className="h-2 bg-gray-300 rounded-full" />

            <div
              className="h-2 bg-green-500 absolute top-0 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />

            {/* 🚚 TRUCK */}
            <div
              className="absolute -top-6 text-xl"
              style={{
                left: `calc(${progress}% - 10px)`
              }}
            >
              🚚
            </div>

          </div>

          {/* STEPS */}
          <div className="flex justify-between mt-3 text-xs">

            {steps.map((s, i) => (
              <span
                key={i}
                className={
                  i <= current
                    ? "text-green-600 font-semibold"
                    : "text-gray-400"
                }
              >
                {s}
              </span>
            ))}

          </div>

        </div>

        {/* 🚚 DELIVERY */}
        <div className="text-center text-sm text-gray-600">
          Expected Delivery: {deliveryDate}
        </div>

        {/* 💰 BREAKDOWN */}
        <div className="text-sm space-y-1">

          <div className="flex justify-between">
            <span>Items</span>
            <span>₹{order.itemsTotal}</span>
          </div>

          <div className="flex justify-between">
            <span>Shipping</span>
            <span>₹{order.shipping}</span>
          </div>

          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>

        </div>

      </div>

    </div>
  );
}

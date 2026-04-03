"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function TrackPage() {

  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, "orders", id), (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      }
    });

    return () => unsub();
  }, [id]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading tracking...
      </div>
    );
  }

  // 🔥 FIXED STATUS FLOW
  const steps = ["Pending", "Placed", "Shipped", "Out for Delivery", "Delivered"];

  const current = steps.indexOf(order.status || "Pending");

  // 🔥 SAFE PROGRESS
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
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-white p-4">

      <div className="max-w-xl mx-auto glass p-5">

        <h1 className="text-2xl font-bold text-center mb-4">
          🚚 Order Tracking
        </h1>

        {/* ORDER INFO */}
        <div className="text-sm text-gray-600">
          <p>Order ID</p>
          <p className="font-bold break-all">{order.id}</p>

          <p className="mt-2">
            Status:{" "}
            <span className="text-green-600 font-bold">
              {order.status || "Pending"}
            </span>
          </p>

          <p className="mt-1">
            Total: ₹{order.total}
          </p>

          <p className="mt-1 text-xs">
            🚚 Expected Delivery: {deliveryDate}
          </p>
        </div>

        {/* 🔥 PROGRESS BAR */}
        <div className="mt-6 relative">

          <div className="h-2 bg-gray-300 rounded-full" />

          <div
            className="h-2 bg-gradient-to-r from-green-400 to-green-600 absolute top-0 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />

          {/* 🚚 TRUCK */}
          <div
            className="absolute -top-6 text-xl transition-all duration-500"
            style={{
              left: `calc(${progress}% - 10px)`
            }}
          >
            🚚
          </div>

        </div>

        {/* 🔥 STEPS */}
        <div className="flex justify-between mt-4 text-xs">

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

    </div>
  );
}

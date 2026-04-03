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

  if (!order) return <div className="p-5">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-white p-4">

      <div className="glass p-5 max-w-md mx-auto">

        <h1 className="text-xl font-bold mb-4 text-center">
          🚚 Order Tracking
        </h1>

        {/* ✅ TOTAL FIX */}
        <div className="text-center mb-4">
          <p className="text-gray-500">Total Amount</p>
          <p className="text-3xl font-bold text-green-600">
            ₹{order.total || 0}
          </p>
        </div>

        {/* ITEMS */}
        <div className="mb-4">
          <p className="font-semibold mb-2">Items</p>

          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{item.name} × {item.qty}</span>
              <span>₹{item.price * item.qty}</span>
            </div>
          ))}
        </div>

        {/* BREAKDOWN */}
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

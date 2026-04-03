"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function OrdersPage() {

  const [orders, setOrders] = useState([]);
  const router = useRouter();

  useEffect(() => {

    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) return router.push("/login");

      const snap = await getDocs(collection(db, "orders"));

      const arr = [];

      snap.forEach(d => {
        const data = d.data();

        if (data.userId === u.uid) {
          arr.push({ id: d.id, ...data });
        }
      });

      setOrders(arr);
    });

    return () => unsub();

  }, []);

  return (
    <div className="p-4 pb-24">

      <h1 className="text-2xl font-bold mb-4">
        My Orders 📦
      </h1>

      {orders.length === 0 && (
        <p>No orders found ❌</p>
      )}

      {orders.map(o => (

        <div
          key={o.id}
          className="bg-white p-4 rounded-xl shadow mb-3"
        >
          <p className="font-semibold">
            Order ID: {o.id}
          </p>

          <p>Total: ₹{o.total}</p>

          <p>Status: {o.status}</p>

          <button
            onClick={() => router.push(`/track/${o.id}`)}
            className="text-blue-600 text-sm mt-2"
          >
            Track Order
          </button>
        </div>

      ))}

    </div>
  );
}

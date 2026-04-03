"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function OrdersPage() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // 🔥 LOAD ORDERS
  useEffect(() => {

    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) return router.push("/login");

      const q = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);

      const arr = [];

      snap.forEach(d => {
        const data = d.data();

        if (data.userId === u.uid) {

          // 🚚 DELIVERY DATE AUTO
          let deliveryDate = "N/A";

          if (data.createdAt?.toDate) {
            const date = data.createdAt.toDate();

            date.setDate(date.getDate() + 5);

            deliveryDate = date.toDateString();
          }

          arr.push({
            id: d.id,
            ...data,
            deliveryDate
          });
        }
      });

      setOrders(arr);
      setLoading(false);
    });

    return () => unsub();

  }, []);

  // 🔥 STATUS COLOR
  const getStatusColor = (status) => {
    if (status === "Delivered") return "text-green-600";
    if (status === "Shipped") return "text-blue-600";
    return "text-yellow-600";
  };

  // 🔥 LOADING
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-24 bg-gradient-to-br from-purple-200 via-pink-100 to-white">

      <h1 className="text-3xl font-bold text-center mb-6">
        My Orders 📦
      </h1>

      {/* ❌ EMPTY */}
      {orders.length === 0 && (
        <p className="text-center text-gray-500">
          No orders found 😢
        </p>
      )}

      {/* 📦 LIST */}
      <div className="space-y-4">

        {orders.map(o => (

          <div
            key={o.id}
            className="glass p-4 animate-fadeIn"
          >

            <p className="text-xs text-gray-500">
              Order ID
            </p>

            <p className="font-bold text-sm break-all">
              {o.id}
            </p>

            <div className="flex justify-between mt-2">

              <p className="font-semibold">
                ₹{o.total}
              </p>

              <p className={`text-sm font-semibold ${getStatusColor(o.status)}`}>
                {o.status || "Pending"}
              </p>

            </div>

            {/* 🚚 DELIVERY DATE */}
            <p className="text-xs text-gray-500 mt-2">
              🚚 Delivery by: {o.deliveryDate}
            </p>

            {/* 🔥 ACTIONS */}
            <div className="flex gap-2 mt-3">

              <button
                onClick={() => router.push(`/track/${o.id}`)}
                className="flex-1 btn-primary text-sm"
              >
                Track Order
              </button>

              <button
                onClick={() => alert("Return/Support coming soon")}
                className="flex-1 border rounded-xl text-sm"
              >
                Help
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

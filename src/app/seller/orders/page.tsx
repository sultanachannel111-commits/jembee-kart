"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingInput, setTrackingInput] = useState<{ [key: string]: string }>({});

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    cancelled: 0,
  });

  /* FETCH ORDERS */
  useEffect(() => {
    const fetchOrders = async () => {
      const snapshot = await getDocs(collection(db, "orders"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(data);

      let total = data.length;
      let pending = 0;
      let delivered = 0;
      let cancelled = 0;

      data.forEach((order: any) => {
        if (order.status === "Pending") pending++;
        if (order.status === "Delivered") delivered++;
        if (order.status === "Cancelled") cancelled++;
      });

      setStats({ total, pending, delivered, cancelled });
      setLoading(false);
    };

    fetchOrders();
  }, []);

  /* UPDATE STATUS */
  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "orders", id), {
      status,
    });

    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status } : order
      )
    );
  };

  /* ADD TRACKING */
  const addTracking = async (id: string) => {
    const trackingId = trackingInput[id];

    if (!trackingId) return;

    await updateDoc(doc(db, "orders", id), {
      trackingId,
      status: "Shipped",
    });

    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? { ...order, trackingId, status: "Shipped" }
          : order
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-white p-6">

      <h1 className="text-3xl font-bold text-pink-600 mb-8">
        Seller Orders Panel 💼
      </h1>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">

        <div className="bg-white p-6 rounded-2xl shadow">
          <p>Total Orders</p>
          <h2 className="text-2xl font-bold">{stats.total}</h2>
        </div>

        <div className="bg-yellow-100 p-6 rounded-2xl shadow">
          <p>Pending</p>
          <h2 className="text-2xl font-bold">{stats.pending}</h2>
        </div>

        <div className="bg-green-100 p-6 rounded-2xl shadow">
          <p>Delivered</p>
          <h2 className="text-2xl font-bold">{stats.delivered}</h2>
        </div>

        <div className="bg-red-100 p-6 rounded-2xl shadow">
          <p>Cancelled</p>
          <h2 className="text-2xl font-bold">{stats.cancelled}</h2>
        </div>

      </div>

      {/* ORDER LIST */}
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-lg">
                {order.productName}
              </h2>

              <span
                className={`px-3 py-1 rounded-full text-sm
                ${
                  order.status === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : order.status === "Delivered"
                    ? "bg-green-100 text-green-700"
                    : order.status === "Cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {order.status}
              </span>
            </div>

            <p className="text-pink-600 font-bold">
              ₹{order.price}
            </p>

            {/* TRACKING */}
            <div className="mt-3 flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter Tracking ID"
                className="border px-3 py-2 rounded-full"
                value={trackingInput[order.id] || ""}
                onChange={(e) =>
                  setTrackingInput({
                    ...trackingInput,
                    [order.id]: e.target.value,
                  })
                }
              />

              <button
                onClick={() => addTracking(order.id)}
                className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition"
              >
                Add Tracking
              </button>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-4 flex gap-4">

              <button
                onClick={() => updateStatus(order.id, "Delivered")}
                className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition"
              >
                Mark Delivered
              </button>

              <button
                onClick={() => updateStatus(order.id, "Cancelled")}
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition"
              >
                Cancel Order
              </button>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

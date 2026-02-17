"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    cancelled: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(data);

      // 🔥 CALCULATE STATS
      let total = data.length;
      let pending = 0;
      let delivered = 0;
      let cancelled = 0;
      let totalAmount = 0;

      data.forEach((order: any) => {
        totalAmount += order.price || 0;

        if (!order.trackingId || order.trackingId === "") {
          pending++;
        } else if (order.status === "Delivered") {
          delivered++;
        } else if (order.status === "Cancelled") {
          cancelled++;
        }
      });

      setStats({
        total,
        pending,
        delivered,
        cancelled,
        totalAmount,
      });

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading Orders...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">

      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {/* 🔥 STATS SECTION */}
      <div className="grid md:grid-cols-5 gap-6 mb-10">

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Total Orders</p>
          <h2 className="text-2xl font-bold">{stats.total}</h2>
        </div>

        <div className="bg-yellow-100 p-6 rounded-xl shadow">
          <p className="text-yellow-600">Pending</p>
          <h2 className="text-2xl font-bold">{stats.pending}</h2>
        </div>

        <div className="bg-green-100 p-6 rounded-xl shadow">
          <p className="text-green-600">Delivered</p>
          <h2 className="text-2xl font-bold">{stats.delivered}</h2>
        </div>

        <div className="bg-red-100 p-6 rounded-xl shadow">
          <p className="text-red-600">Cancelled</p>
          <h2 className="text-2xl font-bold">{stats.cancelled}</h2>
        </div>

        <div className="bg-blue-100 p-6 rounded-xl shadow">
          <p className="text-blue-600">Total Spent</p>
          <h2 className="text-2xl font-bold">₹{stats.totalAmount}</h2>
        </div>

      </div>

      {/* 🔥 ORDER LIST */}
      {orders.length === 0 ? (
        <p className="text-gray-500 text-lg">
          No orders found.
        </p>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div
              key={order.id}
              className="bg-white p-6 rounded-xl shadow"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">
                  {order.productName}
                </h2>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold
                  ${
                    !order.trackingId || order.trackingId === ""
                      ? "bg-yellow-100 text-yellow-600"
                      : order.status === "Delivered"
                      ? "bg-green-100 text-green-600"
                      : order.status === "Cancelled"
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {!order.trackingId || order.trackingId === ""
                    ? "Pending"
                    : order.status}
                </span>
              </div>

              <p className="text-blue-600 font-bold">
                ₹{order.price}
              </p>

              {/* Tracking */}
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  Tracking ID:
                </p>

                {order.trackingId ? (
                  <p className="font-semibold">
                    {order.trackingId}
                  </p>
                ) : (
                  <p className="text-gray-400">
                    Pending...
                  </p>
                )}
              </div>

              <p className="text-sm text-gray-400 mt-2">
                Ordered on:{" "}
                {order.createdAt?.toDate
                  ? order.createdAt.toDate().toLocaleString()
                  : ""}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

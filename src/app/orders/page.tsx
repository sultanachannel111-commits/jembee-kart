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

      try {
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

        // 🔥 CLEAN STATS LOGIC
        let total = data.length;
        let pending = 0;
        let delivered = 0;
        let cancelled = 0;
        let totalAmount = 0;

        data.forEach((order: any) => {
          totalAmount += Number(order.price || 0);

          if (order.status === "Cancelled") {
            cancelled++;
          } else if (order.status === "Delivered") {
            delivered++;
          } else {
            pending++;
          }
        });

        setStats({
          total,
          pending,
          delivered,
          cancelled,
          totalAmount,
        });

      } catch (error) {
        console.log("Order fetch error:", error);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Loading your orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white p-6">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-pink-600 mb-8">
          My Orders 💖
        </h1>

        {/* STATS */}
        <div className="grid md:grid-cols-5 gap-6 mb-10">

          <div className="bg-white p-6 rounded-2xl shadow-md">
            <p className="text-gray-500">Total Orders</p>
            <h2 className="text-2xl font-bold">{stats.total}</h2>
          </div>

          <div className="bg-yellow-100 p-6 rounded-2xl shadow-md">
            <p className="text-yellow-700 font-medium">Pending</p>
            <h2 className="text-2xl font-bold">{stats.pending}</h2>
          </div>

          <div className="bg-green-100 p-6 rounded-2xl shadow-md">
            <p className="text-green-700 font-medium">Delivered</p>
            <h2 className="text-2xl font-bold">{stats.delivered}</h2>
          </div>

          <div className="bg-red-100 p-6 rounded-2xl shadow-md">
            <p className="text-red-700 font-medium">Cancelled</p>
            <h2 className="text-2xl font-bold">{stats.cancelled}</h2>
          </div>

          <div className="bg-purple-100 p-6 rounded-2xl shadow-md">
            <p className="text-purple-700 font-medium">Total Spent</p>
            <h2 className="text-2xl font-bold">₹{stats.totalAmount}</h2>
          </div>

        </div>

        {/* ORDER LIST */}
        {orders.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow text-center">
            <p className="text-gray-500 text-lg">
              You haven't placed any orders yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <div
                key={order.id}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition"
              >
                <div className="flex justify-between items-center mb-3">

                  <h2 className="text-lg font-semibold">
                    {order.productName}
                  </h2>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold
                      ${
                        order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                  >
                    {order.status}
                  </span>
                </div>

                <p className="text-pink-600 font-bold text-lg">
                  ₹{order.price}
                </p>

                <div className="mt-3 text-sm text-gray-600">
                  Tracking ID:{" "}
                  {order.trackingId && order.trackingId !== "" ? (
                    <span className="font-semibold">
                      {order.trackingId}
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      Pending...
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Ordered on:{" "}
                  {order.createdAt?.toDate
                    ? order.createdAt.toDate().toLocaleString()
                    : "N/A"}
                </p>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

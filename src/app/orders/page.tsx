"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

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
      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div
              key={order.id}
              className="bg-white p-6 rounded-xl shadow"
            >
              <h2 className="font-semibold text-lg">
                {order.productName}
              </h2>

              <p className="text-blue-600 font-bold">
                ₹{order.price}
              </p>

              {/* 🔥 STATUS LOGIC */}
              <p className="mt-2 font-semibold">
                Status:{" "}
                {order.trackingId && order.trackingId !== ""
                  ? order.status
                  : "Pending"}
              </p>

              {/* 🔥 SHOW TRACKING ONLY IF AVAILABLE */}
              {order.trackingId && order.trackingId !== "" && (
                <p className="text-sm text-gray-600 mt-1">
                  Tracking ID: {order.trackingId}
                </p>
              )}

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

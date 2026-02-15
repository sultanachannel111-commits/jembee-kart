"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Header } from "@/components/header";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  // ✅ FETCH NEWEST FIRST
  useEffect(() => {
    async function fetchOrders() {
      if (!db) return;

      const q = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(data);
    }

    fetchOrders();
  }, []);

  // ✅ STATUS COLOR CODING
  const statusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/20 text-yellow-600";
      case "Confirmed":
        return "bg-blue-500/20 text-blue-600";
      case "Shipped":
        return "bg-purple-500/20 text-purple-600";
      case "Delivered":
        return "bg-green-500/20 text-green-600";
      default:
        return "bg-gray-500/20 text-gray-600";
    }
  };

  // ✅ STATUS UPDATE + AUTO WHATSAPP
  const handleStatusUpdate = async (
    order: any,
    newStatus: string
  ) => {
    if (!db) return;

    await updateDoc(doc(db, "orders", order.id), {
      status: newStatus,
    });

    // Update UI instantly
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id ? { ...o, status: newStatus } : o
      )
    );

    // 📲 AUTO WHATSAPP MESSAGE
    if (newStatus === "Shipped" || newStatus === "Delivered") {
      const message = `
Hello ${order.customerName},

Your Order ${order.orderId} is now ${newStatus} 🚚

Tracking ID: ${order.trackingId || "Will be updated soon"}

Thank you for shopping with us.
`;

      window.open(
        `https://wa.me/91${order.customerPhone}?text=${encodeURIComponent(
          message
        )}`,
        "_blank"
      );
    }
  };

  // ✅ TRACKING UPDATE
  const handleTrackingUpdate = async (
    orderId: string,
    trackingId: string
  ) => {
    if (!db) return;

    await updateDoc(doc(db, "orders", orderId), {
      trackingId: trackingId,
    });

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, trackingId } : o
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <Header />

      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">
          💎 Admin Order Management
        </h1>

        {orders.map((order) => (
          <div
            key={order.id}
            className="backdrop-blur-lg bg-white/60 border border-white/40 p-6 rounded-2xl shadow-xl mb-6"
          >
            <div className="flex justify-between flex-wrap gap-6">

              <div>
                <p><strong>Order ID:</strong> {order.orderId}</p>
                <p><strong>Name:</strong> {order.customerName}</p>
                <p><strong>Phone:</strong> {order.customerPhone}</p>
                <p><strong>Total:</strong> ₹{order.total}</p>
              </div>

              <div>
                <span
                  className={`px-4 py-1 rounded-full text-sm font-semibold ${statusColor(order.status)}`}
                >
                  {order.status}
                </span>
              </div>

            </div>

            {/* Tracking Update */}
            <div className="mt-4 flex gap-4 flex-wrap">
              <select
                value={order.status}
                onChange={(e) =>
                  handleStatusUpdate(order, e.target.value)
                }
                className="border p-2 rounded-lg bg-white"
              >
                <option>Pending</option>
                <option>Confirmed</option>
                <option>Shipped</option>
                <option>Delivered</option>
              </select>

              <input
                type="text"
                placeholder="Enter Tracking ID"
                defaultValue={order.trackingId || ""}
                className="border p-2 rounded-lg"
                onBlur={(e) =>
                  handleTrackingUpdate(order.id, e.target.value)
                }
              />

              {order.trackingId && (
                <a
                  href={`https://www.delhivery.com/track/${order.trackingId}`}
                  target="_blank"
                  className="px-4 py-2 bg-black text-white rounded-lg"
                >
                  Track Shipment
                </a>
              )}
            </div>

            <div className="mt-3 text-xs text-gray-600">
              Ordered At:{" "}
              {order.createdAt?.seconds
                ? new Date(
                    order.createdAt.seconds * 1000
                  ).toLocaleString()
                : "N/A"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

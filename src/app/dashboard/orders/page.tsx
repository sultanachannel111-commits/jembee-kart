"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }

    fetchOrders();
  }, []);

  // ✅ STATUS UPDATE + AUTO WHATSAPP
  const handleStatusChange = async (
    order: any,
    newStatus: string
  ) => {
    if (!db) return;

    const orderRef = doc(db, "orders", order.id);

    await updateDoc(orderRef, {
      status: newStatus,
    });

    // Update UI instantly
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? { ...o, status: newStatus }
          : o
      )
    );

    // 🚚 Auto WhatsApp when Shipped
    if (newStatus === "Shipped") {
      const message = `Hello ${order.customerName},

Your order ${order.orderId} has been shipped 🚚

Tracking ID: ${
        order.trackingId || "Will be updated soon"
      }

Thank you for shopping with us ❤️`;

      window.open(
        `https://wa.me/${order.customerPhone}?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    }

    // 🎉 Auto WhatsApp when Delivered
    if (newStatus === "Delivered") {
      const message = `Hello ${order.customerName},

Your order ${order.orderId} has been delivered 🎉

We hope you love your purchase ❤️`;

      window.open(
        `https://wa.me/${order.customerPhone}?text=${encodeURIComponent(message)}`,
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

    const orderRef = doc(db, "orders", orderId);

    await updateDoc(orderRef, {
      trackingId: trackingId,
    });
  };

  // 🎨 STATUS COLOR
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Confirmed":
        return "bg-blue-100 text-blue-700";
      case "Shipped":
        return "bg-purple-100 text-purple-700";
      case "Delivered":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">
          📦 Admin Order Management
        </h1>

        {loading && <p>Loading orders...</p>}

        {!loading && orders.length === 0 && (
          <p>No orders found.</p>
        )}

        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white p-6 rounded-2xl shadow-lg mb-6"
          >
            {/* Basic Info */}
            <div className="flex justify-between flex-wrap gap-4">
              <div>
                <p><strong>Order ID:</strong> {order.orderId}</p>
                <p><strong>Name:</strong> {order.customerName}</p>
                <p><strong>Phone:</strong> {order.customerPhone}</p>
                <p><strong>Total:</strong> ₹{order.total}</p>
              </div>

              <span
                className={`px-4 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>

            {/* Products */}
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold mb-2">
                Purchased Products:
              </h3>

              {order.items?.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between text-sm mb-1"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="mt-4 flex flex-wrap gap-4">
              <select
                value={order.status}
                onChange={(e) =>
                  handleStatusChange(order, e.target.value)
                }
                className="border p-2 rounded"
              >
                <option>Pending</option>
                <option>Confirmed</option>
                <option>Shipped</option>
                <option>Delivered</option>
              </select>

              <input
                type="text"
                placeholder="Tracking ID"
                defaultValue={order.trackingId || ""}
                className="border p-2 rounded"
                onBlur={(e) =>
                  handleTrackingUpdate(order.id, e.target.value)
                }
              />
            </div>

            {/* Date */}
            <div className="mt-3 text-xs text-gray-500">
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

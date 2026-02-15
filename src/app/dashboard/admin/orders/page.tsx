"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    async function fetchOrders() {
      const snapshot = await getDocs(collection(db, "orders"));
      setOrders(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    fetchOrders();
  }, []);

  const updateStatus = async (order: any, newStatus: string) => {
    await updateDoc(doc(db, "orders", order.id), {
      status: newStatus,
    });

    if (newStatus === "Shipped") {
      const phone = "91706136922";

      const message = `Hello,
Your order ${order.orderId} has been shipped 🚚
Tracking ID: ${order.trackingId || "Will update soon"}`;

      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">
        Admin Orders
      </h1>

      {orders.map((order) => (
        <div key={order.id} className="border p-4 mb-4">
          <p>Order ID: {order.orderId}</p>
          <p>Status: {order.status}</p>

          <select
            onChange={(e) =>
              updateStatus(order, e.target.value)
            }
          >
            <option>Pending</option>
            <option>Confirmed</option>
            <option>Shipped</option>
            <option>Delivered</option>
          </select>
        </div>
      ))}
    </div>
  );
}

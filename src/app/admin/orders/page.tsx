"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  const fetchOrders = async () => {
    const snap = await getDocs(collection(db, "orders"));
    const list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    setOrders(list);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "orders", id), {
      status,
    });
    fetchOrders();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>All Orders</h1>

      {orders.map((order) => (
        <div key={order.id} style={{ marginBottom: 20 }}>
          <p>Order ID: {order.id}</p>
          <p>Status: {order.status}</p>

          <button onClick={() => updateStatus(order.id, "Shipped")}>
            Mark Shipped
          </button>

          <button onClick={() => updateStatus(order.id, "Delivered")}>
            Mark Delivered
          </button>

          <hr />
        </div>
      ))}
    </div>
  );
}

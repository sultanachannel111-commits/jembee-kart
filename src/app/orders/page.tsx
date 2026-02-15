"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/providers/auth-provider";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!db || !user) return;

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
    }

    fetchOrders();
  }, [user]);

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>

        {loading && <p>Loading...</p>}

        {!loading && orders.length === 0 && (
          <p>You have no orders yet.</p>
        )}

        {orders.map((order: any) => (
          <div key={order.id} className="border p-4 mb-4 rounded">
            <p><strong>Order ID:</strong> {order.orderId}</p>
            <p><strong>Name:</strong> {order.customerName}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total:</strong> ₹{order.totalAmount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

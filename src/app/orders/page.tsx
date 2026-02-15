"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import {
  getDocs,
  collection,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const PAGE_SIZE = 5;

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    if (!db) return;

    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE)
    );

    const snapshot = await getDocs(q);

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setOrders(data);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    setLoading(false);
  }

  async function loadMore() {
    if (!db || !lastDoc) return;

    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(PAGE_SIZE)
    );

    const snapshot = await getDocs(q);

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setOrders((prev) => [...prev, ...data]);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>

        {loading && <p>Loading...</p>}

        {orders.map((order: any) => (
          <div key={order.id} className="border p-4 mb-4 rounded shadow-sm">

            {/* Order ID */}
            <p className="font-semibold">
              Order ID: {order.orderId}
            </p>

            {/* Date */}
            <p className="text-sm text-gray-500 mb-2">
              {order.createdAt?.seconds
                ? new Date(order.createdAt.seconds * 1000).toLocaleString()
                : ""}
            </p>

            {/* Product List */}
            <div className="mb-2">
              {order.items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <p className="font-bold mb-2">
              Total: ₹{order.totalAmount}
            </p>

            {/* Status Color */}
            <p
              className={`font-semibold ${
                order.status === "Confirmed"
                  ? "text-green-600"
                  : "text-yellow-600"
              }`}
            >
              {order.status}
            </p>
          </div>
        ))}

        {/* Pagination */}
        {lastDoc && (
          <button
            onClick={loadMore}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
}

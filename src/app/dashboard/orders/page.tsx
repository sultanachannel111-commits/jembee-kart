"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import {
  getDocs,
  collection,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    if (!db) return;

    const snapshot = await getDocs(collection(db, "orders"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setOrders(data);
    setLoading(false);
  }

  async function updateStatus(orderId: string, newStatus: string) {
    if (!db) return;

    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      status: newStatus,
    });

    fetchOrders();
  }

  async function addTracking(orderId: string, trackingId: string) {
    if (!db) return;

    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      trackingId,
    });

    fetchOrders();
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">
          Admin Order Dashboard
        </h1>

        {loading && <p>Loading...</p>}

        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white p-5 rounded-lg shadow mb-6"
          >
            <p><strong>Order ID:</strong> {order.orderId}</p>
            <p><strong>Name:</strong> {order.customerName}</p>
            <p><strong>Total:</strong> ₹{order.total}</p>

            <p className="mt-2">
              <strong>Status:</strong>{" "}
              <span className="font-semibold">
                {order.status}
              </span>
            </p>

            {order.trackingId && (
              <p>
                <strong>Tracking ID:</strong>{" "}
                {order.trackingId}
              </p>
            )}

            {/* Status Buttons */}
            <div className="flex gap-3 mt-4 flex-wrap">
              <Button
                onClick={() =>
                  updateStatus(order.id, "Pending")
                }
              >
                Pending
              </Button>

              <Button
                onClick={() =>
                  updateStatus(order.id, "Confirmed")
                }
              >
                Confirmed
              </Button>

              <Button
                onClick={() =>
                  updateStatus(order.id, "Shipped")
                }
              >
                Shipped
              </Button>

              <Button
                onClick={() =>
                  updateStatus(order.id, "Delivered")
                }
              >
                Delivered
              </Button>

              <Button
                variant="destructive"
                onClick={() =>
                  updateStatus(order.id, "Cancelled")
                }
              >
                Cancel
              </Button>
            </div>

            {/* Tracking ID Input */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Enter Tracking ID"
                className="border p-2 rounded mr-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addTracking(
                      order.id,
                      (e.target as HTMLInputElement).value
                    );
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

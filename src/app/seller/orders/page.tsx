"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/providers/auth-provider";

export default function SellerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("sellerId", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        const orderList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOrders(orderList);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  // 🔄 Status Update (Manual until webhook setup)
  const updateStatus = async (id: string, newStatus: string) => {
    await updateDoc(doc(db, "orders", id), {
      status: newStatus,
    });

    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  if (loading) return <p className="p-6">Loading Orders...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <p>No Orders Found</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white shadow-lg rounded-xl p-5 border"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">
                    Order ID: {order.qikinkOrderId || order.id}
                  </p>
                  <p className="text-sm text-gray-500">
                    Customer: {order.customerName}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-pink-600">
                    ₹{order.sellingPrice}
                  </p>
                  <p className="text-green-600 text-sm">
                    Profit: ₹{order.profit}
                  </p>
                </div>
              </div>

              <div className="mt-3 text-sm">
                <p>Status: 
                  <span className="ml-2 font-semibold text-blue-600">
                    {order.status}
                  </span>
                </p>

                {order.qikinkTrackingId && (
                  <p>Tracking: {order.qikinkTrackingId}</p>
                )}

                {order.courier && (
                  <p>Courier: {order.courier}</p>
                )}
              </div>

              {/* Manual Status Buttons */}
              <div className="mt-4 flex gap-2 flex-wrap">
                <button
                  onClick={() => updateStatus(order.id, "Processing")}
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  Processing
                </button>

                <button
                  onClick={() => updateStatus(order.id, "Shipped")}
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                >
                  Shipped
                </button>

                <button
                  onClick={() => updateStatus(order.id, "Delivered")}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Delivered
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

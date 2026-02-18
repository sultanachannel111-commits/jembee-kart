"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

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
        setNotLoggedIn(true);
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

        let total = data.length;
        let pending = 0;
        let delivered = 0;
        let cancelled = 0;
        let totalAmount = 0;

        data.forEach((order: any) => {
          totalAmount += Number(order.price || 0);

          if (order.status === "Cancelled") cancelled++;
          else if (order.status === "Delivered") delivered++;
          else pending++;
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

  const cancelOrder = async (orderId: string) => {
    await updateDoc(doc(db, "orders", orderId), {
      status: "Cancelled",
    });

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: "Cancelled" }
          : order
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading your orders...
      </div>
    );
  }

  if (notLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl mb-4">Please login to see your orders 💖</p>
        <Link href="/auth?role=customer">
          <button className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition">
            Login Now
          </button>
        </Link>
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

          <Stat title="Total Orders" value={stats.total} bg="white" />
          <Stat title="Pending" value={stats.pending} bg="yellow" />
          <Stat title="Delivered" value={stats.delivered} bg="green" />
          <Stat title="Cancelled" value={stats.cancelled} bg="red" />
          <Stat title="Total Spent" value={`₹${stats.totalAmount}`} bg="purple" />

        </div>

        {/* ORDER LIST */}
        {orders.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow text-center">
            <p className="text-gray-500 text-lg">
              No orders placed yet 🛒
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

                  <StatusBadge status={order.status} />
                </div>

                <p className="text-pink-600 font-bold text-lg">
                  ₹{order.price}
                </p>

                <div className="mt-2 text-sm text-gray-600">
                  Tracking ID:{" "}
                  {order.trackingId ? (
                    <span className="font-semibold">
                      {order.trackingId}
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      Not assigned yet
                    </span>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="mt-4 flex gap-4 flex-wrap">

                  {order.status === "Pending" && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition"
                    >
                      Cancel Order
                    </button>
                  )}

                  {order.trackingId && (
                    <button className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition">
                      Track Order
                    </button>
                  )}

                </div>

                <p className="text-xs text-gray-400 mt-3">
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

/* STAT COMPONENT */
function Stat({ title, value, bg }: any) {
  const colors: any = {
    white: "bg-white",
    yellow: "bg-yellow-100 text-yellow-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    purple: "bg-purple-100 text-purple-700",
  };

  return (
    <div className={`p-6 rounded-2xl shadow-md ${colors[bg]}`}>
      <p>{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}

/* STATUS BADGE */
function StatusBadge({ status }: any) {
  const style =
    status === "Pending"
      ? "bg-yellow-100 text-yellow-700"
      : status === "Delivered"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${style}`}>
      {status}
    </span>
  );
}

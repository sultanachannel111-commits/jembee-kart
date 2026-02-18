"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingInput, setTrackingInput] = useState<{ [key: string]: string }>({});

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    cancelled: 0,
    revenue: 0,
  });

  /* 🔥 REALTIME FETCH */
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOrders(data);

        let total = data.length;
        let pending = 0;
        let delivered = 0;
        let cancelled = 0;
        let revenue = 0;

        data.forEach((order: any) => {
          revenue += Number(order.price || 0);

          if (order.status === "Cancelled") cancelled++;
          else if (order.status === "Delivered") delivered++;
          else pending++;
        });

        setStats({
          total,
          pending,
          delivered,
          cancelled,
          revenue,
        });

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /* 🔥 UPDATE STATUS */
  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "orders", id), {
      status,
    });
  };

  /* 🔥 ADD TRACKING */
  const addTracking = async (id: string) => {
    const trackingId = trackingInput[id];
    if (!trackingId) return;

    await updateDoc(doc(db, "orders", id), {
      trackingId,
      status: "Shipped",
    });

    setTrackingInput((prev) => ({
      ...prev,
      [id]: "",
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Loading Orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-white p-6">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold text-purple-700 mb-8">
          Seller Orders Dashboard 📦
        </h1>

        {/* 🔥 STATS SECTION */}
        <div className="grid md:grid-cols-5 gap-6 mb-10">

          <StatCard title="Total Orders" value={stats.total} />
          <StatCard title="Pending" value={stats.pending} color="yellow" />
          <StatCard title="Delivered" value={stats.delivered} color="green" />
          <StatCard title="Cancelled" value={stats.cancelled} color="red" />
          <StatCard title="Revenue" value={`₹${stats.revenue}`} color="purple" />

        </div>

        {/* 🔥 ORDER LIST */}
        <div className="space-y-6">

          {orders.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl shadow text-center">
              No Orders Yet.
            </div>
          ) : (
            orders.map((order: any) => (
              <div
                key={order.id}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <div className="flex justify-between items-center mb-3">

                  <div>
                    <h2 className="font-semibold text-lg">
                      {order.productName}
                    </h2>

                    <p className="text-purple-600 font-bold">
                      ₹{order.price}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      User ID: {order.userId}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Ordered on:{" "}
                      {order.createdAt?.toDate
                        ? order.createdAt.toDate().toLocaleString()
                        : ""}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold
                      ${
                        order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                  >
                    {order.status}
                  </span>

                </div>

                {/* TRACKING SECTION */}
                <div className="mt-4 flex flex-col md:flex-row gap-3">

                  <input
                    type="text"
                    placeholder="Enter Tracking ID"
                    className="border px-4 py-2 rounded-full"
                    value={trackingInput[order.id] || ""}
                    onChange={(e) =>
                      setTrackingInput({
                        ...trackingInput,
                        [order.id]: e.target.value,
                      })
                    }
                    disabled={
                      order.status === "Delivered" ||
                      order.status === "Cancelled"
                    }
                  />

                  <button
                    onClick={() => addTracking(order.id)}
                    className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition disabled:opacity-50"
                    disabled={
                      order.status === "Delivered" ||
                      order.status === "Cancelled"
                    }
                  >
                    Add Tracking
                  </button>

                </div>

                {/* ACTION BUTTONS */}
                {order.status === "Pending" && (
                  <div className="mt-4 flex gap-4">

                    <button
                      onClick={() =>
                        updateStatus(order.id, "Delivered")
                      }
                      className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition"
                    >
                      Mark Delivered
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(order.id, "Cancelled")
                      }
                      className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition"
                    >
                      Cancel Order
                    </button>

                  </div>
                )}

                {/* TRACKING DISPLAY */}
                {order.trackingId && (
                  <div className="mt-3 text-sm text-gray-600">
                    Tracking ID:{" "}
                    <span className="font-semibold">
                      {order.trackingId}
                    </span>
                  </div>
                )}

              </div>
            ))
          )}

        </div>

      </div>
    </div>
  );
}

/* 🔥 STAT CARD COMPONENT */
function StatCard({ title, value, color = "white" }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}

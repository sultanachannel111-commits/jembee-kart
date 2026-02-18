"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [trackingInput, setTrackingInput] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    cancelled: 0,
    revenue: 0,
  });

  /* 🔐 AUTH + ROLE CHECK */
  useEffect(() => {
    const auth = getAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth?role=seller");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists() || userDoc.data().role !== "seller") {
        router.push("/");
        return;
      }

      setAuthorized(true);

      /* 🔥 REALTIME ORDERS */
      const unsubscribeOrders = onSnapshot(
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
            if (order.status === "Cancelled") cancelled++;
            else if (order.status === "Delivered") delivered++;
            else pending++;

            // Revenue only from Paid or Delivered
            if (order.status === "Paid" || order.status === "Delivered") {
              revenue += Number(order.price || 0);
            }
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

      return () => unsubscribeOrders();
    });

    return () => unsubscribeAuth();
  }, [router]);

  /* 🔥 UPDATE STATUS */
  const updateStatus = async (order: any, status: string) => {
    await updateDoc(doc(db, "orders", order.id), {
      status,
    });

    // Send Email
    await fetch("/api/send-order-mail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerEmail: order.customerEmail,
        productName: order.productName,
        price: order.price,
        status,
        trackingId: order.trackingId || "",
      }),
    });
  };

  /* 💰 VERIFY PAYMENT */
  const verifyPayment = async (order: any) => {
    await updateDoc(doc(db, "orders", order.id), {
      status: "Paid",
    });

    // 📩 Send Email
    await fetch("/api/send-order-mail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerEmail: order.customerEmail,
        productName: order.productName,
        price: order.price,
        status: "Paid",
      }),
    });

    // 📲 WhatsApp Open
    if (order.customerPhone) {
      const text = `Your payment for ${order.productName} ₹${order.price} is verified ✅`;
      window.open(
        `https://wa.me/${order.customerPhone}?text=${encodeURIComponent(text)}`
      );
    }
  };

  /* 🚚 ADD TRACKING */
  const addTracking = async (order: any) => {
    const trackingId = trackingInput[order.id];
    if (!trackingId) return;

    await updateDoc(doc(db, "orders", order.id), {
      trackingId,
      status: "Shipped",
    });

    await fetch("/api/send-order-mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerEmail: order.customerEmail,
        productName: order.productName,
        price: order.price,
        status: "Shipped",
        trackingId,
      }),
    });

    setTrackingInput((prev) => ({
      ...prev,
      [order.id]: "",
    }));
  };

  if (loading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Checking Seller Access...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-white p-6">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold text-purple-700 mb-8">
          Seller Dashboard 💼
        </h1>

        {/* STATS */}
        <div className="grid md:grid-cols-5 gap-6 mb-10">
          <StatCard title="Total Orders" value={stats.total} />
          <StatCard title="Pending" value={stats.pending} />
          <StatCard title="Delivered" value={stats.delivered} />
          <StatCard title="Cancelled" value={stats.cancelled} />
          <StatCard title="Revenue" value={`₹${stats.revenue}`} />
        </div>

        {/* ORDERS */}
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white p-6 rounded-2xl shadow-lg">

              <div className="flex justify-between items-center mb-3">
                <div>
                  <h2 className="font-semibold text-lg">
                    {order.productName}
                  </h2>
                  <p className="text-purple-600 font-bold">
                    ₹{order.price}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-700">
                  {order.status}
                </span>
              </div>

              {/* 💰 VERIFY PAYMENT BUTTON */}
              {order.status === "Payment Pending" && (
                <button
                  onClick={() => verifyPayment(order)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
                >
                  Verify Payment 💰
                </button>
              )}

              {/* 🚚 TRACKING */}
              <div className="mt-4 flex gap-3">
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
                />
                <button
                  onClick={() => addTracking(order)}
                  className="bg-purple-500 text-white px-4 py-2 rounded-full"
                >
                  Add Tracking
                </button>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => updateStatus(order, "Delivered")}
                  className="bg-green-500 text-white px-4 py-2 rounded-full"
                >
                  Mark Delivered
                </button>

                <button
                  onClick={() => updateStatus(order, "Cancelled")}
                  className="bg-red-500 text-white px-4 py-2 rounded-full"
                >
                  Cancel Order
                </button>
              </div>

              {order.trackingId && (
                <div className="mt-3 text-sm text-gray-600">
                  Tracking ID: {order.trackingId}
                </div>
              )}

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

/* 🔥 STAT CARD */
function StatCard({ title, value }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}

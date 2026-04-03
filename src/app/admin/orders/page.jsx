"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export default function AdminOrdersPage() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ========================
  FETCH ORDERS
  ======================== */

  useEffect(() => {

    const fetchOrders = async () => {

      try {

        const q = query(
          collection(db, "orders"),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        setOrders(data);

      } catch (error) {
        console.log("Fetch Error:", error);
      }

      setLoading(false);
    };

    fetchOrders();

  }, []);

  /* ========================
  SEND TO QIKINK
  ======================== */

  const sendToQikink = async (orderId) => {

    try {

      const res = await fetch("/api/qikink/send-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ orderId })
      });

      const data = await res.json();

      if (data.success) {
        alert("Order sent to Qikink 🚀");
      } else {
        alert("Failed ❌");
      }

    } catch (err) {
      console.log(err);
      alert("Server error ❌");
    }
  };

  /* ========================
  STATUS UPDATE
  ======================== */

  const updateStatus = async (orderId, status) => {

    await updateDoc(doc(db, "orders", orderId), {
      status
    });

    setOrders(prev =>
      prev.map(o =>
        o.id === orderId ? { ...o, status } : o
      )
    );
  };

  /* ========================
  LOADING
  ======================== */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Orders...
      </div>
    );
  }

  /* ========================
  UI
  ======================== */

  return (
    <div className="min-h-screen bg-gray-100 p-4">

      <h1 className="text-2xl font-bold mb-6 text-purple-600">
        Orders Management 📦
      </h1>

      <div className="space-y-4">

        {orders.map(order => {

          const date =
            order.createdAt?.toDate
              ? order.createdAt.toDate().toLocaleString()
              : "No date";

          return (
            <div
              key={order.id}
              className="bg-white p-4 rounded-xl shadow"
            >

              {/* ORDER ID */}
              <p className="text-gray-500 text-sm">Order ID</p>
              <h2 className="font-bold">{order.id}</h2>

              <p className="text-xs text-gray-400 mt-1">{date}</p>

              {/* STATUS */}
              <div className="mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  order.status === "Delivered"
                    ? "bg-green-100 text-green-700"
                    : order.status === "Shipped"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {order.status || "Pending"}
                </span>
              </div>

              {/* CUSTOMER */}
              <div className="mt-3 text-sm">
                <p className="font-semibold">
                  {order.address?.name || "No Name"}
                </p>
                <p>{order.address?.phone || "-"}</p>
                <p className="text-gray-500">
                  {order.address?.address}
                </p>
                <p className="text-gray-500">
                  {order.address?.city} - {order.address?.pincode}
                </p>
              </div>

              {/* PAYMENT */}
              <div className="mt-2 text-sm">
                Payment: <b>{order.paymentMethod}</b>
              </div>

              {/* TOTAL */}
              <div className="mt-2 font-bold">
                ₹{order.total}
              </div>

              {/* ITEMS */}
              <div className="mt-3 text-sm">
                {order.items?.map((item, i) => (
                  <p key={i}>
                    {item.name} x {item.qty}
                  </p>
                ))}
              </div>

              {/* BUTTONS */}
              <div className="mt-4 flex flex-wrap gap-2">

                <button
                  onClick={() => sendToQikink(order.id)}
                  className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Send To Qikink
                </button>

                <button
                  onClick={() => updateStatus(order.id, "Shipped")}
                  className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Shipped
                </button>

                <button
                  onClick={() => updateStatus(order.id, "Delivered")}
                  className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Delivered
                </button>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

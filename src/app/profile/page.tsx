"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [reason, setReason] = useState("");
  const [issue, setIssue] = useState("");

  const router = useRouter();

  // 🔥 LOAD USER + ORDERS
  useEffect(() => {

    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) return router.push("/login");

      setUser(u);

      const snap = await getDocs(collection(db, "orders"));

      const arr = [];

      snap.forEach(d => {
        const data = d.data();

        if (data.userId === u.uid) {
          arr.push({ id: d.id, ...data });
        }
      });

      setOrders(arr);

    });

    return () => unsub();

  }, []);

  // 👤 NAME EXTRACT (email se)
  const getName = () => {
    if (!user?.email) return "User";
    return user.email.split("@")[0].toUpperCase();
  };

  // 🚚 DELIVERY DATE
  const getDeliveryDate = (order) => {
    if (!order.createdAt?.toDate) return "N/A";
    const d = order.createdAt.toDate();
    d.setDate(d.getDate() + 5);
    return d.toDateString();
  };

  // 📊 TRACKING STEPS
  const steps = ["Pending","Placed","Shipped","Out for Delivery","Delivered"];

  return (
    <div className="p-4 pb-24 bg-gradient-to-br from-purple-200 via-pink-100 to-white min-h-screen">

      {/* 👤 USER */}
      <div className="glass p-5 rounded-2xl mb-5 text-center">

        <h1 className="text-2xl font-bold">
          👤 {getName()}
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          {user?.email}
        </p>

        <button
          onClick={() => auth.signOut()}
          className="mt-3 bg-red-500 text-white px-5 py-2 rounded-xl"
        >
          Logout
        </button>

      </div>

      {/* 📦 ORDERS */}
      <h2 className="text-xl font-bold mb-3">
        My Orders 📦
      </h2>

      {orders.length === 0 && (
        <p>No orders found ❌</p>
      )}

      {orders.map(o => {

        const total =
          Number(o.total) ||
          (Number(o.itemsTotal || 0) + Number(o.shipping || 0));

        const current = steps.indexOf(o.status || "Pending");

        const progress =
          current <= 0
            ? 5
            : (current / (steps.length - 1)) * 100;

        return (

          <div
            key={o.id}
            className="glass p-4 rounded-2xl mb-4 shadow"
          >

            {/* 🖼 PRODUCT */}
            {o.items?.length > 0 && (
              <div className="flex gap-3 mb-3">

                <img
                  src={o.items[0]?.image}
                  className="w-16 h-16 rounded-lg border"
                />

                <div className="text-sm">
                  <p className="font-semibold">
                    {o.items[0]?.name}
                  </p>
                  <p className="text-gray-500">
                    Qty: {o.items[0]?.qty}
                  </p>
                </div>

              </div>
            )}

            {/* ORDER ID */}
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-bold break-all">{o.id}</p>

            {/* PRICE */}
            <p className="text-green-600 font-bold mt-2">
              ₹{total}
            </p>

            {/* STATUS */}
            <p className="text-yellow-600 font-semibold">
              {o.status || "Pending"}
            </p>

            {/* 🚚 DELIVERY */}
            <p className="text-xs mt-1">
              🚚 {getDeliveryDate(o)}
            </p>

            {/* 📊 TRACKING BAR */}
            <div className="mt-4">

              <div className="h-2 bg-gray-300 rounded-full" />

              <div
                className="h-2 bg-green-500 rounded-full -mt-2"
                style={{ width: `${progress}%` }}
              />

            </div>

            <div className="flex justify-between text-[10px] mt-2">
              {steps.map((s, i) => (
                <span key={i} className={i <= current ? "text-green-600" : ""}>
                  {s}
                </span>
              ))}
            </div>

            {/* BUTTONS */}
            <div className="flex justify-between mt-3">

              <button
                onClick={() => router.push(`/track/${o.id}`)}
                className="text-blue-600 font-medium"
              >
                Full Track
              </button>

              <button
                onClick={() => {
                  setSelectedOrder(o);
                  setShowHelp(true);
                }}
                className="border px-3 py-1 rounded-full"
              >
                Help
              </button>

            </div>

          </div>
        );

      })}

      {/* 🔥 HELP MODAL */}
      {showHelp && selectedOrder && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-5 rounded-xl w-[90%] max-w-md">

            <h2 className="font-bold mb-3">Help</h2>

            {/* CANCEL */}
            <button
              onClick={async () => {

                if (selectedOrder.paymentMethod === "COD") {
                  await updateDoc(doc(db, "orders", selectedOrder.id), {
                    status: "Cancelled"
                  });
                } else {
                  if (selectedOrder.status !== "Pending") {
                    return alert("Cannot cancel ❌");
                  }
                  await updateDoc(doc(db, "orders", selectedOrder.id), {
                    status: "Cancelled"
                  });
                }

                alert("Cancelled ✅");
                setShowHelp(false);

              }}
              className="w-full bg-red-500 text-white p-2 rounded mb-3"
            >
              Cancel Order
            </button>

            {/* RETURN */}
            <select
              className="w-full border p-2 mb-2"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">Select Reason</option>
              <option>Wrong Product</option>
              <option>Damaged Product</option>
              <option>Size Issue</option>
              <option>Other</option>
            </select>

            {reason === "Other" && (
              <textarea
                placeholder="Write issue..."
                className="w-full border p-2 mb-2"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
              />
            )}

            <button
              onClick={async () => {

                if (!reason) return alert("Select reason");

                await addDoc(collection(db, "returns"), {
                  orderId: selectedOrder.id,
                  reason,
                  issue,
                  status: "Requested",
                  createdAt: new Date()
                });

                alert("Return sent ✅");
                setShowHelp(false);

              }}
              className="w-full bg-green-600 text-white p-2 rounded"
            >
              Request Return
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  getDoc,
  setDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [reason, setReason] = useState("");
  const [issue, setIssue] = useState("");

  const router = useRouter();

  // 🔥 LOAD DATA
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) return router.push("/login");

      setUser(u);

      // 👤 NAME
      const userRef = doc(db, "users", u.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        setName(snap.data().name);
      } else {
        setName(u.email.split("@")[0]);
      }

      // 📦 ORDERS
      const snapOrders = await getDocs(collection(db, "orders"));

      const arr = [];
      snapOrders.forEach(d => {
        const data = d.data();
        if (data.userId === u.uid) {
          arr.push({ id: d.id, ...data });
        }
      });

      setOrders(arr);

    });

    return () => unsub();
  }, []);

  // 🚚 DELIVERY DATE
  const getDeliveryDate = (order) => {
    if (!order.createdAt?.toDate) return "N/A";
    const d = order.createdAt.toDate();
    d.setDate(d.getDate() + 5);
    return d.toDateString();
  };

  // 📊 STATUS TEXT
  const getTrackingText = (status) => {
    switch (status) {
      case "Pending":
        return "Order placed, preparing 📦";
      case "Placed":
        return "Order confirmed ✅";
      case "Shipped":
        return "Shipped from warehouse 🚚";
      case "Out for Delivery":
        return "Out for delivery 🛵";
      case "Delivered":
        return "Delivered successfully 🎉";
      default:
        return "Processing...";
    }
  };

  // 📅 TIMELINE
  const getDates = (order) => {
    if (!order.createdAt?.toDate) return {};
    const base = order.createdAt.toDate();

    return {
      ordered: base.toDateString(),
      shipped: new Date(base.getTime() + 2 * 86400000).toDateString(),
      out: new Date(base.getTime() + 4 * 86400000).toDateString(),
      delivered: new Date(base.getTime() + 5 * 86400000).toDateString()
    };
  };

  const steps = ["Pending","Placed","Shipped","Out for Delivery","Delivered"];

  return (
    <div className="p-4 pb-24 bg-gradient-to-br from-purple-200 via-pink-100 to-white min-h-screen">

      {/* 👤 PROFILE */}
      <div className="bg-white p-5 rounded-2xl mb-5 shadow text-center">

        {!editing ? (
          <>
            <h1 className="text-2xl font-bold">👤 {name}</h1>

            <button
              onClick={() => setEditing(true)}
              className="text-blue-600 text-sm mt-1"
            >
              Edit Name
            </button>
          </>
        ) : (
          <>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded w-full"
            />

            <button
              onClick={async () => {
                await setDoc(doc(db, "users", user.uid), { name });
                setEditing(false);
              }}
              className="bg-green-600 text-white px-4 py-1 rounded mt-2"
            >
              Save
            </button>
          </>
        )}

        <p className="text-sm text-gray-500 mt-2">
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
      <h2 className="text-xl font-bold mb-3">My Orders 📦</h2>

      {orders.map(o => {

        const total =
          Number(o.total) ||
          (Number(o.itemsTotal || 0) + Number(o.shipping || 0));

        const current = steps.indexOf(o.status || "Pending");
        const progress =
          current <= 0 ? 5 : (current / (steps.length - 1)) * 100;

        const d = getDates(o);

        return (
          <div key={o.id} className="bg-white p-4 rounded-2xl mb-4 shadow">

            {/* PRODUCT */}
            {o.items?.length > 0 && (
              <div className="flex gap-3 mb-3">
                <img
                  src={o.items[0]?.image}
                  className="w-16 h-16 rounded-lg border"
                />
                <div>
                  <p className="font-semibold">{o.items[0]?.name}</p>
                  <p className="text-gray-500 text-sm">
                    Qty: {o.items[0]?.qty}
                  </p>
                </div>
              </div>
            )}

            {/* PRICE */}
            <p className="text-green-600 font-bold">₹{total}</p>

            {/* STATUS */}
            <p className="text-yellow-600 font-semibold">
              {o.status}
            </p>

            {/* DELIVERY */}
            <p className="text-xs mt-1">
              🚚 {getDeliveryDate(o)}
            </p>

            {/* TRACK BAR */}
            <div className="mt-3">
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

            {/* 📍 MAP */}
            <div className="mt-4">
              <iframe
                src="https://maps.google.com/maps?q=Jamshedpur&z=13&output=embed"
                className="w-full h-40 rounded-xl"
              />
            </div>

            {/* 🔥 STATUS TEXT */}
            <div className="mt-3 bg-gray-50 p-3 rounded-xl">

              <p className="text-green-600 font-semibold">
                {getTrackingText(o.status)}
              </p>

              <p className="text-xs mt-2 text-gray-500">
                📍 Rider near your area
              </p>

              {/* TIMELINE */}
              <div className="mt-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Ordered</span>
                  <span>{d.ordered}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipped</span>
                  <span>{d.shipped}</span>
                </div>
                <div className="flex justify-between">
                  <span>Out</span>
                  <span>{d.out}</span>
                </div>
                <div className="flex justify-between font-bold text-green-600">
                  <span>Delivery</span>
                  <span>{d.delivered}</span>
                </div>
              </div>

            </div>

            {/* BUTTONS */}
            <div className="flex justify-between mt-3">
              <button
                onClick={() => router.push(`/track/${o.id}`)}
                className="text-blue-600"
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

      {/* HELP MODAL */}
      {showHelp && selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-xl w-[90%] max-w-md">

            <button
              onClick={async () => {
                await updateDoc(doc(db, "orders", selectedOrder.id), {
                  status: "Cancelled"
                });
                alert("Cancelled ✅");
                setShowHelp(false);
              }}
              className="w-full bg-red-500 text-white p-2 rounded mb-3"
            >
              Cancel Order
            </button>

            <select
              className="w-full border p-2 mb-2"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">Select Reason</option>
              <option>Wrong Product</option>
              <option>Damaged Product</option>
              <option>Other</option>
            </select>

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

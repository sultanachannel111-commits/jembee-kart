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

  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [address, setAddress] = useState(""); // 🔥 NEW
  const [editing, setEditing] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [reason, setReason] = useState("");
  const [issue, setIssue] = useState("");

  const router = useRouter();

  // 🔥 LOAD DATA
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) return router.push("/login");

      setUser(u);

      const userRef = doc(db, "users", u.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        setName(snap.data().name || "");
        setAddress(snap.data().address || ""); // 🔥 LOAD ADDRESS
      } else {
        setName(u.email.split("@")[0]);
      }

      // 📦 ORDERS
      const snapOrders = await getDocs(collection(db, "orders"));

      const arr: any[] = [];
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
  const getDeliveryDate = (order: any) => {
    if (!order.createdAt?.toDate) return "N/A";
    const d = order.createdAt.toDate();
    d.setDate(d.getDate() + 5);
    return d.toDateString();
  };

  const steps = ["Pending","Placed","Shipped","Out for Delivery","Delivered"];

  return (
    <div className="p-4 pb-24 bg-gradient-to-br from-purple-200 via-pink-100 to-white min-h-screen">

      {/* 👤 PROFILE */}
      <div className="bg-white p-5 rounded-2xl mb-5 shadow text-center">

        {!editing ? (
          <>
            <h1 className="text-2xl font-bold">👤 {name}</h1>

            {/* 🔥 ADDRESS SHOW */}
            {address && (
              <p className="text-sm text-gray-600 mt-1">
                📍 {address}
              </p>
            )}

            <button
              onClick={() => setEditing(true)}
              className="text-blue-600 text-sm mt-1"
            >
              Edit Profile
            </button>
          </>
        ) : (
          <>
            {/* NAME */}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              className="border p-2 rounded w-full mb-2"
            />

            {/* 🔥 ADDRESS INPUT */}
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
              className="border p-2 rounded w-full mb-2"
            />

            <button
              onClick={async () => {

                await setDoc(doc(db, "users", user.uid), {
                  name,
                  address // 🔥 SAVE ADDRESS
                }, { merge: true });

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

      {orders.length === 0 && (
        <p>No orders found ❌</p>
      )}

      {orders.map(o => {

        const total =
          Number(o.total) ||
          (Number(o.itemsTotal || 0) + Number(o.shipping || 0));

        const current = steps.indexOf(o.status || "Pending");
        const progress =
          current <= 0 ? 5 : (current / (steps.length - 1)) * 100;

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
              🚚 Expected Delivery: {getDeliveryDate(o)}
            </p>

            {/* PROGRESS */}
            <div className="mt-3">
              <div className="h-2 bg-gray-300 rounded-full" />
              <div
                className="h-2 bg-green-500 rounded-full -mt-2"
                style={{ width: `${progress}%` }}
              />
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

    </div>
  );
}

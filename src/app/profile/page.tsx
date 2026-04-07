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
  const [address, setAddress] = useState(""); // ✅

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

      try {
        const userRef = doc(db, "users", u.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();

          setName(data?.name || "");
          setAddress(data?.address || ""); // ✅ SAFE
        } else {
          setName(u.email?.split("@")[0] || "");
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

      } catch (err) {
        console.log("Load error:", err);
      }

    });

    return () => unsub();

  }, []);

  // 🚚 DELIVERY DATE
  const getDeliveryDate = (order: any) => {
    if (!order?.createdAt?.toDate) return "N/A";
    const d = order.createdAt.toDate();
    d.setDate(d.getDate() + 5);
    return d.toDateString();
  };

  // 📊 STATUS TEXT
  const getTrackingText = (status: string) => {
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
  const getDates = (order: any) => {
    if (!order?.createdAt?.toDate) return {};
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

            {/* ✅ ADDRESS SHOW */}
            {address && (
              <p className="text-sm text-gray-600 mt-1">
                📍 {address}
              </p>
            )}

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
              className="border p-2 rounded w-full mb-2"
            />

            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
              className="border p-2 rounded w-full"
            />

            <button
              onClick={async () => {
                if (!user) return;

                await setDoc(
                  doc(db, "users", user.uid),
                  {
                    name,
                    address
                  },
                  { merge: true }
                );

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

      {/* बाकी पूरा code same */}
    </div>
  );
}

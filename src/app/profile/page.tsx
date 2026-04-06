"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  getDoc,
  setDoc,
  deleteDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {

  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);
  const [newAddress, setNewAddress] = useState("");

  const router = useRouter();

  // ================= LOAD =================
  useEffect(() => {

    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) return router.push("/login");

      setUser(u);

      // NAME
      const userRef = doc(db, "users", u.uid);
      const snap = await getDoc(userRef);

      setName(
        snap.exists() ? snap.data().name : u.email.split("@")[0]
      );

      // ORDERS
      const snapOrders = await getDocs(collection(db, "orders"));

      let arr: any[] = [];
      snapOrders.forEach(d => {
        const data = d.data();
        if (data.userId === u.uid) {
          arr.push({ id: d.id, ...data });
        }
      });

      setOrders(arr);

      // ADDRESSES
      const addSnap = await getDocs(
        collection(db, "users", u.uid, "addresses")
      );

      let addArr: any[] = [];
      addSnap.forEach(d => {
        addArr.push({ id: d.id, ...d.data() });
      });

      setAddresses(addArr);

    });

    return () => unsub();

  }, []);

  // ================= ADDRESS =================
  const addAddress = async () => {

    if (!newAddress) return alert("Enter address");

    await addDoc(
      collection(db, "users", user.uid, "addresses"),
      {
        address: newAddress,
        createdAt: new Date()
      }
    );

    setNewAddress("");
    location.reload();
  };

  const deleteAddress = async (id: string) => {

    await deleteDoc(
      doc(db, "users", user.uid, "addresses", id)
    );

    setAddresses(addresses.filter(a => a.id !== id));
  };

  // ================= TRACK =================
  const steps = ["PENDING", "PLACED", "SHIPPED", "OUT FOR DELIVERY", "DELIVERED"];

  const getProgress = (status: string) => {
    const i = steps.indexOf((status || "PENDING").toUpperCase());
    return i < 0 ? 10 : ((i + 1) / steps.length) * 100;
  };

  // ================= UI =================
  return (

    <div className="p-4 pb-24 min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-white">

      {/* PROFILE */}
      <div className="glass p-5 rounded-2xl mb-5 text-center">

        {!editing ? (
          <>
            <h1 className="text-2xl font-bold">👤 {name}</h1>

            <button onClick={() => setEditing(true)} className="text-blue-600 text-sm">
              Edit Name
            </button>
          </>
        ) : (
          <>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input"
            />

            <button
              onClick={async () => {
                await setDoc(doc(db, "users", user.uid), { name });
                setEditing(false);
              }}
              className="btn-green mt-2"
            >
              Save
            </button>
          </>
        )}

        <p className="text-sm text-gray-500 mt-2">{user?.email}</p>

        <button onClick={() => auth.signOut()} className="btn-red mt-3">
          Logout
        </button>

      </div>

      {/* ADDRESS */}
      <div className="glass p-4 rounded-2xl mb-5">

        <h2 className="font-bold mb-2">My Addresses 📍</h2>

        <div className="flex gap-2 mb-3">
          <input
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            placeholder="Enter address..."
            className="glass-input flex-1"
          />

          <button onClick={addAddress} className="btn-blue">
            Add
          </button>
        </div>

        {addresses.map(a => (
          <div key={a.id} className="flex justify-between mb-2">
            <p>{a.address}</p>
            <button onClick={() => deleteAddress(a.id)} className="text-red-500">
              Delete
            </button>
          </div>
        ))}

      </div>

      {/* ORDERS */}
      <h2 className="text-xl font-bold mb-3">My Orders 📦</h2>

      {orders.map(o => {

        const item = o.items?.[0] || {};
        const image = item.image || "/no-image.png";
        const name = item.name || "Product";
        const total = Number(o.total) || 0;
        const status = (o.status || "PENDING").toUpperCase();

        return (
          <div key={o.id} className="glass p-4 rounded-2xl mb-4">

            {/* PRODUCT */}
            <div className="flex gap-3 mb-3">
              <img src={image} className="w-16 h-16 rounded-lg border" />

              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-green-600 font-bold">₹{total}</p>
              </div>
            </div>

            {/* STATUS */}
            <p className="text-yellow-600 font-semibold mb-2">
              {status}
            </p>

            {/* PROGRESS */}
            <div className="h-2 bg-gray-300 rounded-full">
              <div
                className="h-2 bg-green-500 rounded-full"
                style={{ width: `${getProgress(status)}%` }}
              />
            </div>

            {/* STEPS */}
            <div className="flex justify-between text-xs mt-2">
              {steps.map((s, i) => (
                <span
                  key={i}
                  className={
                    steps.indexOf(s) <= steps.indexOf(status)
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                >
                  {s}
                </span>
              ))}
            </div>

            {/* 🔥 LIVE TRACKING */}
            <div className="mt-4 glass p-3 rounded-xl">

              <p className="font-semibold mb-2">Live Tracking 📍</p>

              {o.tracking?.length > 0 ? (
                o.tracking.map((t:any, i:number) => (

                  <div key={i} className="flex gap-3 mb-3">

                    <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>

                    <div>
                      <p className="text-sm font-semibold">{t.status}</p>
                      <p className="text-xs text-gray-500">📍 {t.location}</p>
                      <p className="text-xs text-gray-400">
                        {t.time?.toDate
                          ? t.time.toDate().toLocaleString()
                          : "Now"}
                      </p>
                    </div>

                  </div>

                ))
              ) : (
                <p className="text-sm text-gray-400">
                  Tracking not started yet
                </p>
              )}

            </div>

            {/* BUTTON */}
            <button
              onClick={() => router.push(`/track/${o.id}`)}
              className="text-blue-600 mt-3"
            >
              Full Track →
            </button>

          </div>
        );
      })}

    </div>
  );
}

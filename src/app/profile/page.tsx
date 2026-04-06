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

      let arr: any[] = [];
      snapOrders.forEach(d => {
        const data = d.data();
        if (data.userId === u.uid) {
          arr.push({ id: d.id, ...data });
        }
      });
      setOrders(arr);

      // 📍 ADDRESSES
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

  // ================= ADD ADDRESS =================
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
    location.reload(); // simple refresh
  };

  // ================= DELETE ADDRESS =================
  const deleteAddress = async (id: string) => {

    await deleteDoc(
      doc(db, "users", user.uid, "addresses", id)
    );

    setAddresses(addresses.filter(a => a.id !== id));
  };

  // ================= UI =================
  return (

    <div className="p-4 pb-24 min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-white">

      {/* 👤 PROFILE */}
      <div className="glass p-5 rounded-2xl mb-5 text-center">

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
              className="glass-input"
            />

            <button
              onClick={async () => {
                await setDoc(doc(db, "users", user.uid), { name });
                setEditing(false);
              }}
              className="btn-green"
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
          className="btn-red mt-3"
        >
          Logout
        </button>

      </div>

      {/* 📍 ADDRESS SECTION */}
      <h2 className="text-xl font-bold mb-2">My Addresses 📍</h2>

      <div className="glass p-4 rounded-2xl mb-4">

        <div className="flex gap-2 mb-3">
          <input
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            placeholder="Enter new address..."
            className="glass-input flex-1"
          />

          <button onClick={addAddress} className="btn-blue">
            Add
          </button>
        </div>

        {addresses.map((a) => (
          <div
            key={a.id}
            className="flex justify-between items-center mb-2 glass p-2 rounded-xl"
          >
            <p className="text-sm">{a.address}</p>

            <button
              onClick={() => deleteAddress(a.id)}
              className="text-red-500 text-sm"
            >
              Delete
            </button>
          </div>
        ))}

      </div>

      {/* 📦 ORDERS */}
      <h2 className="text-xl font-bold mb-3">My Orders 📦</h2>

      {orders.map(o => {

        const total = Number(o.total) || 0;

        return (
          <div key={o.id} className="glass p-4 rounded-2xl mb-4">

            <p className="font-semibold">
              {o.items?.[0]?.name}
            </p>

            <p className="text-green-600 font-bold">
              ₹{total}
            </p>

            <p className="text-yellow-600">
              {o.status}
            </p>

          </div>
        );
      })}

    </div>
  );
}

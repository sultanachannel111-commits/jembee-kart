"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);

  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);

  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    address: ""
  });

  const [showAddressForm, setShowAddressForm] = useState(false);

  const router = useRouter();

  // ================= LOAD =================
  useEffect(() => {

    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) {
        router.push("/login");
        return;
      }

      setUser(u);

      try {

        // 👤 USER
        const userSnap = await getDoc(doc(db, "users", u.uid));
        setName(
          userSnap.exists()
            ? userSnap.data().name
            : u.email.split("@")[0]
        );

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

        // 📍 ADDRESSES (✅ SAME AS CHECKOUT)
        const addrSnap = await getDocs(
          collection(db, "users", u.uid, "addresses")
        );

        const addrList = [];
        addrSnap.forEach(d => {
          addrList.push({ id: d.id, ...d.data() });
        });

        setAddresses(addrList);

      } catch (err) {
        console.log(err);
      }

      setLoading(false);

    });

    return () => unsub();

  }, []);

  // ================= ADD ADDRESS =================
  const saveAddress = async () => {

    if (!newAddress.address || newAddress.phone.length < 10) {
      alert("Fill address & phone properly");
      return;
    }

    await addDoc(
      collection(db, "users", user.uid, "addresses"),
      {
        ...newAddress,
        createdAt: serverTimestamp()
      }
    );

    setNewAddress({ name: "", phone: "", address: "" });
    setShowAddressForm(false);

    // reload
    const snap = await getDocs(
      collection(db, "users", user.uid, "addresses")
    );

    const arr = [];
    snap.forEach(d => arr.push({ id: d.id, ...d.data() }));

    setAddresses(arr);
  };

  // ================= DELETE ADDRESS =================
  const deleteAddr = async (id) => {

    await deleteDoc(
      doc(db, "users", user.uid, "addresses", id)
    );

    setAddresses(addresses.filter(a => a.id !== id));
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="max-w-md mx-auto p-4 pb-28 min-h-screen bg-gray-50">

      {/* PROFILE */}
      <div className="bg-white p-6 rounded-2xl shadow mb-5 text-center">

        {!editing ? (
          <>
            <h1 className="text-xl font-bold">{name}</h1>
            <button onClick={() => setEditing(true)} className="text-blue-500 text-sm">
              Edit
            </button>
          </>
        ) : (
          <>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 w-full rounded"
            />

            <button
              onClick={async () => {
                await setDoc(
                  doc(db, "users", user.uid),
                  { name },
                  { merge: true }
                );
                setEditing(false);
              }}
              className="bg-green-500 text-white px-4 py-1 mt-2 rounded"
            >
              Save
            </button>
          </>
        )}

        <p className="text-xs text-gray-500">{user.email}</p>

        <button
          onClick={() => auth.signOut()}
          className="mt-3 bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>

      </div>

      {/* ADDRESS */}
      <div className="bg-white p-5 rounded-2xl shadow mb-5">

        <div className="flex justify-between mb-3">
          <h2 className="font-bold">Addresses</h2>
          <button onClick={() => setShowAddressForm(!showAddressForm)}>
            +
          </button>
        </div>

        {showAddressForm && (
          <div className="space-y-2 mb-3">

            <input
              placeholder="Name"
              value={newAddress.name}
              onChange={(e) =>
                setNewAddress({ ...newAddress, name: e.target.value })
              }
              className="border p-2 w-full rounded"
            />

            <input
              placeholder="Phone"
              value={newAddress.phone}
              onChange={(e) =>
                setNewAddress({
                  ...newAddress,
                  phone: e.target.value.replace(/\D/g, "")
                })
              }
              className="border p-2 w-full rounded"
            />

            <input
              placeholder="Full Address"
              value={newAddress.address}
              onChange={(e) =>
                setNewAddress({ ...newAddress, address: e.target.value })
              }
              className="border p-2 w-full rounded"
            />

            <button
              onClick={saveAddress}
              className="bg-black text-white w-full py-2 rounded"
            >
              Save Address
            </button>

          </div>
        )}

        {addresses.map(a => (
          <div key={a.id} className="flex justify-between border p-2 rounded mb-2">

            <div className="text-sm">
              <p>{a.name}</p>
              <p>{a.phone}</p>
              <p>{a.address}</p>
            </div>

            <button onClick={() => deleteAddr(a.id)}>
              🗑
            </button>

          </div>
        ))}

      </div>

      {/* ORDERS */}
      <h2 className="font-bold mb-2">Orders</h2>

      {orders.map(o => (
        <div key={o.id} className="bg-white p-3 rounded-xl mb-3 shadow">

          <p>{o.items?.[0]?.name}</p>
          <p>₹{o.total}</p>
          <p>{o.status}</p>

        </div>
      ))}

    </div>
  );
}

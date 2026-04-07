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
  updateDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);

  // 🔥 ADDRESS SYSTEM
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    address: ""
  });

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
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          setName(snap.data()?.name || u.email.split("@")[0]);
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

        // 📍 ADDRESSES
        const addrSnap = await getDocs(
          collection(db, "users", u.uid, "addresses")
        );

        const list = [];
        addrSnap.forEach(d => {
          list.push({ id: d.id, ...d.data() });
        });

        setAddresses(list);

      } catch (err) {
        console.log("Error:", err);
      }

    });

    return () => unsub();

  }, []);

  // ================= ADD ADDRESS =================
  const addAddress = async () => {

    if (!newAddress.name || !newAddress.phone || !newAddress.address) {
      return alert("Fill all fields ❌");
    }

    await addDoc(
      collection(db, "users", user.uid, "addresses"),
      {
        ...newAddress,
        isDefault: addresses.length === 0
      }
    );

    setNewAddress({ name: "", phone: "", address: "" });

    location.reload(); // simple refresh
  };

  // ================= DELETE ADDRESS =================
  const deleteAddress = async (id) => {

    await deleteDoc(doc(db, "users", user.uid, "addresses", id));

    setAddresses(addresses.filter(a => a.id !== id));
  };

  // ================= SET DEFAULT =================
  const setDefault = async (id) => {

    const ref = collection(db, "users", user.uid, "addresses");
    const snap = await getDocs(ref);

    snap.forEach(async d => {
      await updateDoc(doc(db, "users", user.uid, "addresses", d.id), {
        isDefault: false
      });
    });

    await updateDoc(doc(db, "users", user.uid, "addresses", id), {
      isDefault: true
    });

    location.reload();
  };

  // ================= DELIVERY DATE =================
  const getDeliveryDate = (order) => {
    if (!order?.createdAt?.toDate) return "N/A";
    const d = order.createdAt.toDate();
    d.setDate(d.getDate() + 5);
    return d.toDateString();
  };

  const steps = ["Pending","Placed","Shipped","Out for Delivery","Delivered"];

  // ================= UI =================
  return (
    <div className="p-4 bg-gray-100 min-h-screen">

      {/* 👤 PROFILE */}
      <div className="bg-white p-5 rounded-xl shadow mb-4 text-center">

        {!editing ? (
          <>
            <h2 className="text-xl font-bold">👤 {name}</h2>

            <button
              onClick={() => setEditing(true)}
              className="text-blue-600 text-sm mt-2"
            >
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
              className="bg-green-600 text-white px-4 py-1 mt-2 rounded"
            >
              Save
            </button>
          </>
        )}

        <p className="text-sm mt-2">{user?.email}</p>

        <button
          onClick={() => auth.signOut()}
          className="bg-red-500 text-white px-4 py-2 mt-3 rounded"
        >
          Logout
        </button>

      </div>

      {/* 📍 ADD ADDRESS */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">

        <h3 className="font-bold mb-2">Add Address</h3>

        <input
          placeholder="Name"
          value={newAddress.name}
          onChange={(e) =>
            setNewAddress({ ...newAddress, name: e.target.value })
          }
          className="border p-2 w-full mb-2 rounded"
        />

        <input
          placeholder="Phone"
          value={newAddress.phone}
          onChange={(e) =>
            setNewAddress({ ...newAddress, phone: e.target.value })
          }
          className="border p-2 w-full mb-2 rounded"
        />

        <input
          placeholder="Full Address"
          value={newAddress.address}
          onChange={(e) =>
            setNewAddress({ ...newAddress, address: e.target.value })
          }
          className="border p-2 w-full mb-2 rounded"
        />

        <button
          onClick={addAddress}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Save Address
        </button>

      </div>

      {/* 📍 ADDRESS LIST */}
      <div className="mb-4">
        <h3 className="font-bold mb-2">My Addresses</h3>

        {addresses.map(a => (
          <div key={a.id} className="bg-white p-3 rounded mb-2 shadow">

            <p className="font-bold">
              {a.name} {a.isDefault && "⭐"}
            </p>
            <p>{a.phone}</p>
            <p className="text-sm">{a.address}</p>

            <div className="flex gap-2 mt-2">

              {!a.isDefault && (
                <button
                  onClick={() => setDefault(a.id)}
                  className="text-blue-600 text-sm"
                >
                  Set Default
                </button>
              )}

              <button
                onClick={() => deleteAddress(a.id)}
                className="text-red-500 text-sm"
              >
                Delete
              </button>

            </div>

          </div>
        ))}
      </div>

      {/* 📦 ORDERS */}
      <h2 className="font-bold mb-2">My Orders</h2>

      {orders.map(o => {

        const total =
          Number(o?.total) ||
          (Number(o?.itemsTotal || 0) + Number(o?.shipping || 0));

        const current = steps.indexOf(o?.status || "Pending");
        const progress =
          current <= 0 ? 5 : (current / (steps.length - 1)) * 100;

        return (
          <div key={o.id} className="bg-white p-3 rounded mb-3 shadow">

            <p className="font-bold">₹{total}</p>
            <p>{o.status}</p>

            <p className="text-xs">
              🚚 {getDeliveryDate(o)}
            </p>

            <div className="mt-2">
              <div className="h-2 bg-gray-300 rounded"/>
              <div
                className="h-2 bg-green-500 rounded -mt-2"
                style={{ width: `${progress}%` }}
              />
            </div>

          </div>
        );
      })}

    </div>
  );
}

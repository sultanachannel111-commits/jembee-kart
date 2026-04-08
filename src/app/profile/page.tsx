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
  query,
  where,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);

  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);

  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    zip: "",
    phone: ""
  });

  const [showAddressForm, setShowAddressForm] = useState(false);

  const [showHelp, setShowHelp] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnReason, setReturnReason] = useState("");

  const router = useRouter();

  // ================= MOUNT =================
  useEffect(() => {
    setMounted(true);
  }, []);

  // ================= LOAD =================
  useEffect(() => {
    if (!mounted) return;

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
            : u.email?.split("@")[0]
        );

        // 📦 ORDERS
        const oSnap = await getDocs(collection(db, "orders"));

        const userOrders = [];

        oSnap.forEach((d) => {
          if (d.data().userId === u.uid) {
            userOrders.push({ id: d.id, ...d.data() });
          }
        });

        setOrders(userOrders);

        // 🏠 ADDRESSES
        const q = query(
          collection(db, "addresses"),
          where("userId", "==", u.uid)
        );

        const aSnap = await getDocs(q);

        const addrList = [];

        aSnap.forEach((d) =>
          addrList.push({ id: d.id, ...d.data() })
        );

        setAddresses(addrList);

      } catch (err) {
        console.log(err);
      }

      setLoading(false);
    });

    return () => unsub();

  }, [mounted, router]);

  // ================= PHONE FIX =================
  const handlePhoneInput = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.startsWith("0")) val = val.substring(1);

    setNewAddress({ ...newAddress, phone: val });
  };

  // ================= SAVE ADDRESS =================
  const saveAddress = async () => {

    if (!newAddress.street || newAddress.phone.length < 10) {
      return alert("Valid address & phone required");
    }

    try {
      const ref = await addDoc(collection(db, "addresses"), {
        ...newAddress,
        userId: user.uid,
        createdAt: serverTimestamp()
      });

      setAddresses([{ id: ref.id, ...newAddress }, ...addresses]);

      setNewAddress({
        street: "",
        city: "",
        zip: "",
        phone: ""
      });

      setShowAddressForm(false);

    } catch {
      alert("Error saving address");
    }
  };

  // ================= DELETE ADDRESS =================
  const deleteAddr = async (id) => {
    try {
      await deleteDoc(doc(db, "addresses", id));
      setAddresses(addresses.filter(a => a.id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  // ================= CANCEL ORDER =================
  const cancelOrder = async (orderId) => {

    if (!confirm("Cancel this order?")) return;

    await updateDoc(doc(db, "orders", orderId), {
      status: "Cancelled"
    });

    setOrders(
      orders.map(o =>
        o.id === orderId
          ? { ...o, status: "Cancelled" }
          : o
      )
    );

    setShowHelp(false);
  };

  // ================= LOADING =================
  if (!mounted || loading) {
    return (
      <div className="h-screen flex items-center justify-center font-bold">
        JEMBEE SYNC...
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="max-w-md mx-auto p-4 pb-24 bg-gray-50 min-h-screen">

      {/* 👤 PROFILE */}
      <div className="bg-white p-6 rounded-2xl shadow mb-4 text-center">

        {!editing ? (
          <>
            <h1
              className="text-xl font-bold"
              onClick={() => setEditing(true)}
            >
              {name} ✏️
            </h1>
          </>
        ) : (
          <div className="flex gap-2">
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
              className="bg-black text-white px-3 rounded"
            >
              ✓
            </button>
          </div>
        )}

        <p className="text-xs text-gray-400">{user?.email}</p>

        <button
          onClick={() => auth.signOut()}
          className="text-red-500 mt-3 text-sm"
        >
          Logout
        </button>
      </div>

      {/* 🏠 ADDRESSES */}
      <div className="bg-white p-4 rounded-xl mb-4">

        <div className="flex justify-between mb-3">
          <h2 className="font-bold">Addresses</h2>
          <button onClick={() => setShowAddressForm(!showAddressForm)}>+</button>
        </div>

        {showAddressForm && (
          <div className="space-y-2 mb-3">
            <input placeholder="Street" value={newAddress.street}
              onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
              className="border p-2 w-full rounded"
            />
            <input placeholder="City" value={newAddress.city}
              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
              className="border p-2 w-full rounded"
            />
            <input placeholder="Zip" value={newAddress.zip}
              onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
              className="border p-2 w-full rounded"
            />
            <input placeholder="Phone" value={newAddress.phone}
              onChange={handlePhoneInput}
              className="border p-2 w-full rounded"
            />
            <button onClick={saveAddress} className="bg-black text-white w-full py-2 rounded">
              Save
            </button>
          </div>
        )}

        {addresses.map(a => (
          <div key={a.id} className="flex justify-between text-sm border-b py-2">
            <div>
              {a.street}, {a.city} ({a.phone})
            </div>
            <button onClick={() => deleteAddr(a.id)} className="text-red-500">
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* 📦 ORDERS */}
      <h2 className="font-bold mb-2">Orders</h2>

      {orders.map(o => (
        <div key={o.id} className="bg-white p-3 rounded-xl mb-3 flex gap-3 items-center">

          <img
            src={o.items?.[0]?.image || "/placeholder.png"}
            className="w-14 h-14 rounded"
          />

          <div className="flex-1">
            <p className="text-sm font-bold">
              {o.items?.[0]?.name}
            </p>

            <p className="text-green-600">₹{o.total}</p>

            <p className="text-xs">{o.status}</p>
          </div>

          {/* TRACK BUTTON */}
          <button
            onClick={() => router.push(`/track/${o.id}`)}
            className="bg-gray-200 px-2 py-1 rounded"
          >
            Track
          </button>

          {/* HELP */}
          <button
            onClick={() => {
              setSelectedOrder(o);
              setShowHelp(true);
            }}
            className="bg-black text-white px-2 py-1 rounded"
          >
            ?
          </button>

        </div>
      ))}

      {/* MODAL */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

          <div className="bg-white p-5 rounded-xl w-[90%]">

            {(selectedOrder?.status === "Pending" ||
              selectedOrder?.status === "Placed") && (

              <button
                onClick={() => cancelOrder(selectedOrder.id)}
                className="w-full bg-red-500 text-white py-2 rounded mb-3"
              >
                Cancel Order
              </button>
            )}

            <button
              onClick={() => setShowHelp(false)}
              className="w-full border py-2 rounded"
            >
              Close
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

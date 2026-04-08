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
  updateDoc
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
  const [newAddress, setNewAddress] = useState({ street: "", city: "", zip: "" });
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }
      setUser(u);

      try {
        // 1. Get User Name
        const userSnap = await getDoc(doc(db, "users", u.uid));
        setName(userSnap.exists() ? userSnap.data().name : u.email?.split("@")[0]);

        // 2. Get Orders (Safe Fetch)
        const oRef = collection(db, "orders");
        const oSnap = await getDocs(oRef);
        const userOrders = [];
        oSnap.forEach((d) => {
          if (d.data().userId === u.uid) userOrders.push({ id: d.id, ...d.data() });
        });
        setOrders(userOrders);

        // 3. Get Addresses
        const aRef = collection(db, "addresses");
        const q = query(aRef, where("userId", "==", u.uid));
        const aSnap = await getDocs(q);
        const addrList = [];
        aSnap.forEach((d) => addrList.push({ id: d.id, ...d.data() }));
        setAddresses(addrList);

      } catch (error) {
        console.error("Firebase Error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  // Address Actions
  const saveAddress = async () => {
    if (!newAddress.street || !newAddress.city) return alert("Fill details");
    try {
      const docRef = await addDoc(collection(db, "addresses"), {
        ...newAddress,
        userId: user.uid
      });
      setAddresses([...addresses, { id: docRef.id, ...newAddress }]);
      setNewAddress({ street: "", city: "", zip: "" });
      setShowAddressForm(false);
    } catch (e) { alert("Error saving address"); }
  };

  const deleteAddr = async (id) => {
    try {
      await deleteDoc(doc(db, "addresses", id));
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (e) { alert("Error deleting"); }
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-bold">Loading Profile...</div>;

  return (
    <div className="max-w-md mx-auto p-4 pb-20 bg-gray-50 min-h-screen">
      
      {/* 👤 Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm mb-4 border border-gray-100">
        {!editing ? (
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Hi, {name}! 👋</h1>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
            <button onClick={() => setEditing(true)} className="text-blue-600 text-sm">Edit</button>
          </div>
        ) : (
          <div className="space-y-2">
            <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-xl" />
            <button onClick={async () => {
              await setDoc(doc(db, "users", user.uid), { name }, { merge: true });
              setEditing(false);
            }} className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm">Save Name</button>
          </div>
        )}
        <button onClick={() => auth.signOut()} className="mt-4 text-red-500 text-xs font-bold uppercase tracking-wider">Logout</button>
      </div>

      {/* 🏠 Addresses */}
      <div className="bg-white p-5 rounded-3xl shadow-sm mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold">Saved Addresses</h2>
          <button onClick={() => setShowAddressForm(!showAddressForm)} className="text-blue-600 text-xl">{showAddressForm ? "×" : "+"}</button>
        </div>

        {showAddressForm && (
          <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-2xl">
            <input placeholder="Street" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full p-2 text-sm border rounded-lg" />
            <div className="flex gap-2">
              <input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-1/2 p-2 text-sm border rounded-lg" />
              <input placeholder="Zip" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} className="w-1/2 p-2 text-sm border rounded-lg" />
            </div>
            <button onClick={saveAddress} className="w-full bg-black text-white py-2 rounded-xl text-sm">Add Address</button>
          </div>
        )}

        <div className="space-y-3">
          {addresses.length === 0 && <p className="text-xs text-gray-400">No addresses yet.</p>}
          {addresses.map(a => (
            <div key={a.id} className="flex justify-between items-start border-b border-gray-50 pb-2">
              <div>
                <p className="text-sm font-medium">{a.street}</p>
                <p className="text-[10px] text-gray-400">{a.city}, {a.zip}</p>
              </div>
              <button onClick={() => deleteAddr(a.id)} className="text-red-400 text-xs">Remove</button>
            </div>
          ))}
        </div>
      </div>

      {/* 📦 Orders */}
      <h2 className="font-bold mb-3 px-1 text-lg">Your Orders</h2>
      {orders.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl text-center text-gray-400 text-sm">No orders found.</div>
      ) : (
        orders.map(o => (
          <div key={o.id} className="bg-white p-4 rounded-3xl mb-3 shadow-sm flex gap-4 items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden">
              <img src={o.items?.[0]?.image || "/placeholder.png"} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold truncate w-40">{o.items?.[0]?.name || "Order"}</p>
              <p className="text-green-600 font-black">₹{o.total}</p>
              <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">{o.status || "Processing"}</span>
            </div>
            <button onClick={() => router.push(`/track/${o.id}`)} className="bg-gray-100 p-2 rounded-full">
              ➔
            </button>
          </div>
        ))
      )}
    </div>
  );
}

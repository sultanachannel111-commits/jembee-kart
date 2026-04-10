"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection, getDocs, doc, getDoc, setDoc, addDoc, 
  deleteDoc, query, where, updateDoc, serverTimestamp
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
  const [newAddress, setNewAddress] = useState({ street: "", city: "", zip: "", phone: "" });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/login"); return; }
      setUser(u);
      try {
        const userSnap = await getDoc(doc(db, "users", u.uid));
        setName(userSnap.exists() ? userSnap.data().name : u.email?.split("@")[0]);

        const oSnap = await getDocs(collection(db, "orders"));
        const userOrders = [];
        oSnap.forEach((d) => {
          if (d.data().userId === u.uid) userOrders.push({ id: d.id, ...d.data() });
        });
        setOrders(userOrders.sort((a, b) => b.createdAt - a.createdAt));

        const q = query(collection(db, "addresses"), where("userId", "==", u.uid));
        const aSnap = await getDocs(q);
        const addrList = [];
        aSnap.forEach((d) => addrList.push({ id: d.id, ...d.data() }));
        setAddresses(addrList);
      } catch (err) { console.log(err); }
      setLoading(false);
    });
    return () => unsub();
  }, [mounted, router]);

  const handleOrderAction = async (orderId, actionType) => {
    const newStatus = actionType === "RETURN" ? "Return Requested" : "Cancelled";
    if (!confirm(`Are you sure you want to ${actionType.toLowerCase()}?`)) return;
    await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    setShowHelp(false);
  };

  const saveAddress = async () => {
    if (!newAddress.street || !newAddress.zip || newAddress.phone.length < 10) return alert("Fill all details correctly");
    const ref = await addDoc(collection(db, "addresses"), { ...newAddress, userId: user.uid });
    setAddresses([{ id: ref.id, ...newAddress }, ...addresses]);
    setNewAddress({ street: "", city: "", zip: "", phone: "" });
    setShowAddressForm(false);
  };

  if (!mounted || loading) return <div className="h-screen flex items-center justify-center font-bold">JEMBEE SYNC...</div>;

  return (
    <div className="max-w-md mx-auto p-4 pb-20 bg-gray-50 min-h-screen">
      {/* 👤 PROFILE CARD */}
      <div className="bg-white p-6 rounded-3xl shadow-sm mb-6 text-center border border-gray-100">
        {!editing ? (
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2" onClick={() => setEditing(true)}>
            {name} <span className="text-sm opacity-50">✏️</span>
          </h1>
        ) : (
          <div className="flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} className="border p-2 w-full rounded-xl" />
            <button onClick={async () => { await setDoc(doc(db, "users", user.uid), { name }, { merge: true }); setEditing(false); }} className="bg-black text-white px-4 rounded-xl">✓</button>
          </div>
        )}
        <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
        <button onClick={() => auth.signOut()} className="text-red-500 mt-4 text-xs font-bold tracking-widest uppercase">Logout</button>
      </div>

      {/* 🏠 ADDRESSES */}
      <div className="bg-white p-5 rounded-3xl mb-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">My Addresses</h2>
          <button onClick={() => setShowAddressForm(!showAddressForm)} className="bg-gray-100 w-8 h-8 rounded-full font-bold">+</button>
        </div>

        {showAddressForm && (
          <div className="space-y-3 mb-4 bg-gray-50 p-4 rounded-2xl">
            <input placeholder="Street/Area" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} className="w-full p-3 rounded-xl border-none ring-1 ring-gray-200" />
            <div className="flex gap-2">
              <input placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="w-1/2 p-3 rounded-xl border-none ring-1 ring-gray-200" />
              <input placeholder="Zip Code" value={newAddress.zip} onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })} className="w-1/2 p-3 rounded-xl border-none ring-1 ring-gray-200" />
            </div>
            <input placeholder="Phone" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} className="w-full p-3 rounded-xl border-none ring-1 ring-gray-200" />
            <button onClick={saveAddress} className="bg-black text-white w-full py-3 rounded-xl font-bold">Save Address</button>
          </div>
        )}

        {addresses.map(a => (
          <div key={a.id} className="py-3 border-b last:border-0 flex justify-between items-start">
            <div className="text-sm">
              <p className="font-medium">{a.street}</p>
              <p className="text-gray-500">{a.city}, {a.zip}</p>
              <p className="text-gray-400 text-xs">Ph: {a.phone}</p>
            </div>
            <button onClick={() => deleteDoc(doc(db, "addresses", a.id))} className="text-red-400 text-xs">Remove</button>
          </div>
        ))}
      </div>

      {/* 📦 ORDERS */}
      <h2 className="font-bold text-lg mb-4 px-2">Order History</h2>
      {orders.map(o => (
        <div key={o.id} className="bg-white p-4 rounded-3xl mb-3 flex gap-4 items-center shadow-sm border border-gray-100">
          <img src={o.items?.[0]?.image || "/placeholder.png"} className="w-16 h-16 rounded-2xl object-cover bg-gray-100" />
          <div className="flex-1">
            <p className="text-sm font-bold truncate w-32">{o.items?.[0]?.name}</p>
            <p className="font-bold text-black">₹{o.total}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${o.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{o.status}</span>
          </div>
          <button onClick={() => router.push(`/track/${o.id}`)} className="bg-gray-100 p-2 rounded-xl text-xs font-bold">Track</button>
          <button onClick={() => { setSelectedOrder(o); setShowHelp(true); }} className="bg-black text-white w-8 h-8 rounded-xl flex items-center justify-center">?</button>
        </div>
      ))}

      {/* MODAL HELPER */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white p-6 rounded-3xl w-full max-w-xs shadow-2xl">
            <h3 className="font-bold text-lg mb-4 text-center">Order Options</h3>
            {(selectedOrder?.status === "Pending" || selectedOrder?.status === "Placed") && (
              <button onClick={() => handleOrderAction(selectedOrder.id, "CANCEL")} className="w-full bg-red-500 text-white py-3 rounded-2xl mb-3 font-bold">Cancel Order</button>
            )}
            {selectedOrder?.status === "Delivered" && (
              <button onClick={() => handleOrderAction(selectedOrder.id, "RETURN")} className="w-full bg-orange-500 text-white py-3 rounded-2xl mb-3 font-bold">Return Order</button>
            )}
            <button onClick={() => setShowHelp(false)} className="w-full bg-gray-100 py-3 rounded-2xl font-bold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

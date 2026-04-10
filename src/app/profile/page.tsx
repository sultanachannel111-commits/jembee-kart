"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection, getDocs, doc, getDoc, setDoc, addDoc, 
  deleteDoc, query, where, updateDoc
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

  const removeAddress = async (id) => {
    const originalAddresses = [...addresses];
    setAddresses(addresses.filter(a => a.id !== id));
    try {
      await deleteDoc(doc(db, "addresses", id));
    } catch (err) {
      setAddresses(originalAddresses);
      alert("Delete fail!");
    }
  };

  // 🔥 UPDATED ACTION LOGIC
  const handleOrderAction = async (orderId, actionType) => {
    const confirmMsg = actionType === "RETURN" 
      ? "Do you want to request a return for this order?" 
      : "Are you sure you want to cancel this order?";
    
    if (!confirm(confirmMsg)) return;

    const newStatus = actionType === "RETURN" ? "Return Requested" : "Cancelled";
    
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      // Update local state instantly
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      setShowHelp(false); // Modal close karo
      alert(`Order ${actionType === "RETURN" ? "return requested" : "cancelled"} successfully! ✅`);
    } catch (err) {
      alert("Action failed. Try again.");
    }
  };

  const saveAddress = async () => {
    if (!newAddress.street || !newAddress.zip || newAddress.phone.length < 10) return alert("Details bharo!");
    const ref = await addDoc(collection(db, "addresses"), { ...newAddress, userId: user.uid });
    setAddresses([{ id: ref.id, ...newAddress }, ...addresses]);
    setNewAddress({ street: "", city: "", zip: "", phone: "" });
    setShowAddressForm(false);
  };

  if (!mounted || loading) return <div className="h-screen flex items-center justify-center font-bold">JEMBEE SYNC...</div>;

  return (
    <div className="max-w-md mx-auto p-4 pb-20 bg-gray-50 min-h-screen font-sans">
      
      {/* 👤 PROFILE */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm mb-6 text-center border border-gray-100">
        {!editing ? (
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2" onClick={() => setEditing(true)}>
            {name} <span className="text-sm opacity-30">✏️</span>
          </h1>
        ) : (
          <div className="flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} className="border p-2 w-full rounded-xl outline-none ring-1 ring-black" />
            <button onClick={async () => { await setDoc(doc(db, "users", user.uid), { name }, { merge: true }); setEditing(false); }} className="bg-black text-white px-4 rounded-xl">✓</button>
          </div>
        )}
        <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
      </div>

      {/* 🏠 ADDRESSES */}
      <div className="bg-white p-5 rounded-[2rem] mb-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">My Addresses</h2>
          <button onClick={() => setShowAddressForm(!showAddressForm)} className="bg-black text-white w-8 h-8 rounded-full font-bold">+</button>
        </div>

        {showAddressForm && (
          <div className="space-y-3 mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <input placeholder="Street/Area" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} className="w-full p-3 rounded-xl border-none ring-1 ring-gray-200" />
            <div className="flex gap-2">
              <input placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="w-1/2 p-3 rounded-xl border-none ring-1 ring-gray-200" />
              <input placeholder="Zip Code" value={newAddress.zip} onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })} className="w-1/2 p-3 rounded-xl border-none ring-1 ring-gray-200" />
            </div>
            <input placeholder="Phone" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} className="w-full p-3 rounded-xl border-none ring-1 ring-gray-200" />
            <button onClick={saveAddress} className="bg-black text-white w-full py-3 rounded-xl font-bold">Save</button>
          </div>
        )}

        <div className="divide-y divide-gray-100">
          {addresses.map(a => (
            <div key={a.id} className="py-4 flex justify-between items-start">
              <div className="text-sm">
                <p className="font-bold">{a.street}</p>
                <p className="text-gray-500">{a.city} - <span className="font-bold text-black">{a.zip}</span></p>
              </div>
              <button onClick={() => removeAddress(a.id)} className="text-red-400 text-xs">Remove</button>
            </div>
          ))}
        </div>
      </div>

      {/* 📦 ORDERS */}
      <h2 className="font-bold text-lg mb-4 px-2">Order History</h2>
      {orders.map(o => (
        <div key={o.id} className="bg-white p-4 rounded-3xl mb-3 flex gap-4 items-center shadow-sm border border-gray-100">
          <img src={o.items?.[0]?.image || "/placeholder.png"} className="w-16 h-16 rounded-2xl object-cover bg-gray-50" />
          <div className="flex-1">
            <p className="text-sm font-bold truncate w-32 uppercase">{o.items?.[0]?.name}</p>
            <p className="font-bold text-black">₹{o.total}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black tracking-tighter uppercase ${
              o.status?.toUpperCase() === 'CANCELLED' ? 'bg-red-50 text-red-500' : 
              o.status?.toUpperCase() === 'DELIVERED' ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-600'
            }`}>{o.status}</span>
          </div>
          <button onClick={() => router.push(`/track/${o.id}`)} className="bg-gray-100 p-2 rounded-xl text-[10px] font-bold uppercase">Track</button>
          
          {/* Question Mark Button */}
          <button 
            onClick={() => { setSelectedOrder(o); setShowHelp(true); }} 
            className="bg-black text-white w-9 h-9 rounded-xl flex items-center justify-center font-bold"
          >
            ?
          </button>
        </div>
      ))}

      {/* 🛠 FIXED MODAL WITH CANCEL/RETURN OPTIONS */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[99] p-6">
          <div className="bg-white p-6 rounded-[2.5rem] w-full max-w-xs shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-black text-xl mb-6 text-center text-slate-800">Order Help</h3>
            
            <div className="space-y-3">
              {/* Status can be Pending, Placed, etc. for Cancellation */}
              {(selectedOrder?.status?.toUpperCase() === "PENDING" || 
                selectedOrder?.status?.toUpperCase() === "PLACED") && (
                <button 
                  onClick={() => handleOrderAction(selectedOrder.id, "CANCEL")} 
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-red-100 hover:bg-red-600"
                >
                  CANCEL ORDER
                </button>
              )}

              {/* Status must be Delivered for Return */}
              {selectedOrder?.status?.toUpperCase() === "DELIVERED" && (
                <button 
                  onClick={() => handleOrderAction(selectedOrder.id, "RETURN")} 
                  className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-orange-100 hover:bg-orange-600"
                >
                  RETURN ORDER
                </button>
              )}

              {/* If order is already Cancelled or Returned, show info */}
              {(selectedOrder?.status?.toUpperCase() === "CANCELLED" || 
                selectedOrder?.status?.toUpperCase() === "RETURN REQUESTED") && (
                <p className="text-center text-gray-500 text-sm font-bold py-2">
                  No actions available for this status.
                </p>
              )}

              <button 
                onClick={() => setShowHelp(false)} 
                className="w-full bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold border border-gray-200"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

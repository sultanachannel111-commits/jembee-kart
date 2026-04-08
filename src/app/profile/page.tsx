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
  deleteDoc,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [orders, setOrders] = useState([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);

  // 🏠 Address States
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({ street: "", city: "", zip: "", phone: "" });
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [returnReason, setReturnReason] = useState("");

  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.push("/login");
      setUser(u);

      try {
        const userRef = doc(db, "users", u.uid);
        const snap = await getDoc(userRef);
        setName(snap.exists() ? snap.data().name : u.email?.split("@")[0]);

        const snapOrders = await getDocs(collection(db, "orders"));
        const arr = [];
        snapOrders.forEach(d => {
          if (d.data().userId === u.uid) arr.push({ id: d.id, ...d.data() });
        });
        setOrders(arr.sort((a, b) => b.createdAt - a.createdAt));

        const q = query(collection(db, "addresses"), where("userId", "==", u.uid));
        const addrSnap = await getDocs(q);
        const addrList = [];
        addrSnap.forEach(doc => addrList.push({ id: doc.id, ...doc.data() }));
        setAddresses(addrList);

      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    });
    return () => unsub();
  }, [mounted, router]);

  // --- 🔥 MOBILE NUMBER FIX (Removes leading 0) ---
  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, ""); // Sirf numbers allow honge
    if (val.startsWith("0")) {
      val = val.substring(1); // Agar 0 se shuru ho raha hai toh hata do
    }
    setNewAddress({ ...newAddress, phone: val });
  };

  const handleAddAddress = async () => {
    if (!newAddress.street || newAddress.phone.length < 10) {
      return alert("Please enter a valid address and 10-digit phone number");
    }
    try {
      const addrData = { ...newAddress, userId: user.uid, lastUsed: serverTimestamp() };
      const docRef = await addDoc(collection(db, "addresses"), addrData);
      setAddresses([{ id: docRef.id, ...addrData }, ...addresses]);
      setNewAddress({ street: "", city: "", zip: "", phone: "" });
      setShowAddressForm(false);
    } catch (e) { alert("Error saving address"); }
  };

  const deleteAddr = async (id) => {
    if(confirm("Delete this address?")) {
      await deleteDoc(doc(db, "addresses", id));
      setAddresses(addresses.filter(a => a.id !== id));
    }
  };

  // --- 📦 CANCEL & RETURN LOGIC ---
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    if (confirm("Are you sure you want to cancel this order?")) {
      try {
        await updateDoc(doc(db, "orders", selectedOrder.id), { status: "Cancelled" });
        setOrders(orders.map(o => o.id === selectedOrder.id ? {...o, status: "Cancelled"} : o));
        alert("Order Cancelled Successfully ✅");
        setShowHelp(false);
      } catch (e) { alert("Action failed"); }
    }
  };

  const handleReturnRequest = async () => {
    if (!returnReason) return alert("Please select a reason");
    try {
      await addDoc(collection(db, "returns"), {
        orderId: selectedOrder.id,
        userId: user.uid,
        reason: returnReason,
        status: "Pending Approval",
        requestDate: serverTimestamp(),
      });
      await updateDoc(doc(db, "orders", selectedOrder.id), { status: "Return Requested" });
      setOrders(orders.map(o => o.id === selectedOrder.id ? {...o, status: "Return Requested"} : o));
      alert("Return Request Submitted ✅");
      setShowHelp(false);
      setReturnReason("");
    } catch (e) { alert("Error submitting return"); }
  };

  if (!mounted || loading) return <div className="h-screen flex items-center justify-center bg-white font-bold text-purple-600">✨ Syncing Profile...</div>;

  const steps = ["Pending", "Placed", "Shipped", "Out for Delivery", "Delivered"];

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-4 pb-32 font-sans">
      
      {/* 👤 PROFILE HEADER */}
      <div className="bg-white/70 backdrop-blur-2xl border border-white p-6 rounded-[2.5rem] shadow-xl shadow-gray-200/50 text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {name.charAt(0).toUpperCase()}
        </div>
        {!editing ? (
          <h1 className="text-xl font-black text-gray-800" onClick={() => setEditing(true)}>{name} ✏️</h1>
        ) : (
          <div className="flex gap-2 justify-center">
            <input value={name} onChange={e => setName(e.target.value)} className="bg-gray-100 border-none rounded-xl p-2 text-center text-sm w-40" autoFocus />
            <button onClick={async () => { await setDoc(doc(db, "users", user.uid), { name }, { merge: true }); setEditing(false); }} className="bg-black text-white px-3 rounded-xl text-xs">Save</button>
          </div>
        )}
        <p className="text-gray-400 text-xs mt-1 font-medium">{user?.email}</p>
        <button onClick={() => auth.signOut()} className="mt-4 px-6 py-2 bg-red-50 text-red-500 rounded-full text-[10px] font-black tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all">LOGOUT</button>
      </div>

      {/* 🏠 SAVED ADDRESSES */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-lg mb-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-black text-gray-800 tracking-tight">Saved Addresses</h2>
          <button onClick={() => setShowAddressForm(!showAddressForm)} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${showAddressForm ? 'bg-gray-100 text-black' : 'bg-black text-white'}`}>
            {showAddressForm ? "✕" : "+"}
          </button>
        </div>

        {showAddressForm && (
          <div className="space-y-3 mb-6 p-4 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 animate-in fade-in slide-in-from-top-2">
            <input placeholder="Full Address / Landmark" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full p-4 rounded-2xl bg-white border-none shadow-sm text-sm" />
            <div className="flex gap-2">
              <input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-1/2 p-4 rounded-2xl bg-white border-none shadow-sm text-sm" />
              <input placeholder="Pincode" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} className="w-1/2 p-4 rounded-2xl bg-white border-none shadow-sm text-sm" />
            </div>
            {/* Phone input with 0-removal logic */}
            <input 
              type="tel" 
              placeholder="Mobile Number (without 0)" 
              value={newAddress.phone} 
              onChange={handlePhoneChange} 
              className="w-full p-4 rounded-2xl bg-white border-none shadow-sm text-sm font-bold text-indigo-600" 
            />
            <button onClick={handleAddAddress} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-100">SAVE ADDRESS</button>
          </div>
        )}

        <div className="space-y-3">
          {addresses.map(a => (
            <div key={a.id} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-50">
              <div className="flex items-start gap-3">
                <span className="mt-1">📍</span>
                <div>
                  <p className="text-xs font-bold text-gray-800">{a.street}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{a.city}, {a.zip} • {a.phone}</p>
                </div>
              </div>
              <button onClick={() => deleteAddr(a.id)} className="text-xs grayscale opacity-30 hover:opacity-100">🗑️</button>
            </div>
          ))}
        </div>
      </div>

      {/* 📦 ORDER HISTORY */}
      <h2 className="text-lg font-black text-gray-800 mb-4 px-2">Order History</h2>
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm italic">No orders yet...</div>
        ) : orders.map(o => {
          const current = steps.indexOf(o.status || "Pending");
          const progress = ((current + 1) / steps.length) * 100;
          return (
            <div key={o.id} className="bg-white/90 backdrop-blur-md p-5 rounded-[2.2rem] border border-white shadow-xl shadow-gray-100">
              <div className="flex gap-4 mb-4">
                <img src={o.items?.[0]?.image} className="w-16 h-16 rounded-2xl object-cover bg-gray-50 border" />
                <div className="flex-1">
                  <h3 className="font-bold text-xs text-gray-800 line-clamp-1">{o.items?.[0]?.name}</h3>
                  <div className="flex justify-between items-end mt-1">
                    <p className="text-indigo-600 font-black text-base">₹{o.total}</p>
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${o.status === 'Cancelled' ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-600'}`}>
                      {o.status || "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Glassy Progress */}
              <div className="h-1.5 w-full bg-gray-100 rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${o.status === 'Cancelled' ? 0 : progress}%` }} />
              </div>

              <div className="flex justify-between items-center">
                <button onClick={() => router.push(`/track/${o.id}`)} className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Track Pack</button>
                <button onClick={() => { setSelectedOrder(o); setShowHelp(true); }} className="px-5 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-gray-200">Help & Return</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔮 HELP & RETURN MODAL (Bottom Sheet) */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-t-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-8" onClick={() => setShowHelp(false)} />
            
            <h3 className="text-2xl font-black text-gray-800 mb-6 text-center tracking-tighter">Order Support</h3>

            <div className="space-y-4">
              
              {/* --- CANCEL SECTION (TOP) --- */}
              {(selectedOrder?.status === "Pending" || selectedOrder?.status === "Placed") && (
                <div className="p-1 bg-red-50 rounded-[1.8rem] border border-red-100">
                  <button onClick={handleCancelOrder} className="w-full py-5 text-red-600 font-black text-sm uppercase tracking-widest">
                    🚫 Cancel My Order
                  </button>
                </div>
              )}

              {/* --- RETURN SECTION --- */}
              <div className="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100">
                <h4 className="font-black text-indigo-900 text-sm mb-4 uppercase">Return Policy Request</h4>
                <select 
                  value={returnReason} 
                  onChange={e => setReturnReason(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-white border-none text-xs font-bold shadow-sm mb-4"
                >
                  <option value="">Select a reason...</option>
                  <option>Defective/Damaged</option>
                  <option>Quality not as expected</option>
                  <option>Wrong item received</option>
                  <option>Changed my mind</option>
                </select>
                <button 
                  onClick={handleReturnRequest}
                  disabled={selectedOrder?.status === "Cancelled" || selectedOrder?.status === "Return Requested"}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-indigo-200 disabled:opacity-50"
                >
                  CONFIRM RETURN
                </button>
              </div>
              
              <button onClick={() => setShowHelp(false)} className="w-full py-4 text-gray-400 text-[10px] font-black uppercase tracking-widest">Close Menu</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

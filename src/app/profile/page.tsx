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

  // 🏠 Address States (Synced with Checkout)
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
        // User Info
        const userRef = doc(db, "users", u.uid);
        const snap = await getDoc(userRef);
        setName(snap.exists() ? snap.data().name : u.email?.split("@")[0]);

        // Orders
        const snapOrders = await getDocs(collection(db, "orders"));
        const arr = [];
        snapOrders.forEach(d => {
          if (d.data().userId === u.uid) arr.push({ id: d.id, ...d.data() });
        });
        setOrders(arr.sort((a, b) => b.createdAt - a.createdAt));

        // Addresses (Order by default/recent)
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

  // --- ADDRESS ACTIONS (Synced for Checkout) ---
  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.phone) return alert("Fill essential details");
    try {
      const addrData = { ...newAddress, userId: user.uid, lastUsed: serverTimestamp() };
      const docRef = await addDoc(collection(db, "addresses"), addrData);
      setAddresses([{ id: docRef.id, ...addrData }, ...addresses]);
      setNewAddress({ street: "", city: "", zip: "", phone: "" });
      setShowAddressForm(false);
    } catch (e) { alert("Error saving address"); }
  };

  const deleteAddr = async (id) => {
    await deleteDoc(doc(db, "addresses", id));
    setAddresses(addresses.filter(a => a.id !== id));
  };

  // --- RETURN LOGIC ---
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
      // Update order status to show return in progress
      await updateDoc(doc(db, "orders", selectedOrder.id), { status: "Return Requested" });
      alert("Return Request Submitted Successfully ✅");
      setShowHelp(false);
      setReturnReason("");
    } catch (e) { alert("Return failed. Try again."); }
  };

  if (!mounted || loading) return <div className="h-screen flex items-center justify-center bg-purple-50">✨ Loading Luxury...</div>;

  const steps = ["Pending", "Placed", "Shipped", "Out for Delivery", "Delivered"];

  return (
    <div className="min-h-screen bg-[#f8f9ff] p-4 pb-28 font-sans">
      
      {/* 👤 PREMIUM PROFILE CARD */}
      <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-2xl shadow-purple-100 text-center mb-8">
        <div className="w-24 h-24 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl text-white shadow-lg">
          {name.charAt(0).toUpperCase()}
        </div>
        {!editing ? (
          <h1 className="text-2xl font-black text-gray-800" onClick={() => setEditing(true)}>{name} ✏️</h1>
        ) : (
          <div className="flex gap-2 justify-center">
            <input value={name} onChange={e => setName(e.target.value)} className="bg-white/50 border-none rounded-lg p-1 text-center focus:ring-2 ring-purple-400" />
            <button onClick={async () => { await setDoc(doc(db, "users", user.uid), { name }, { merge: true }); setEditing(false); }} className="text-green-600 font-bold">✓</button>
          </div>
        )}
        <p className="text-gray-500 text-sm">{user?.email}</p>
        <button onClick={() => auth.signOut()} className="mt-6 px-8 py-2 bg-red-500/10 text-red-500 rounded-full text-xs font-bold hover:bg-red-500 hover:text-white transition-all">LOGOUT</button>
      </div>

      {/* 🏠 ADDRESS BOX (Synced) */}
      <div className="bg-white/60 backdrop-blur-md border border-white p-6 rounded-[1.5rem] mb-8 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-700">Delivery Addresses</h2>
          <button onClick={() => setShowAddressForm(!showAddressForm)} className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg">
            {showAddressForm ? "✕" : "+"}
          </button>
        </div>

        {showAddressForm && (
          <div className="space-y-3 mb-6 animate-in fade-in zoom-in duration-300">
            <input placeholder="House No / Street" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full p-4 rounded-2xl bg-white/80 border-none shadow-inner" />
            <div className="flex gap-3">
              <input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-1/2 p-4 rounded-2xl bg-white/80 border-none shadow-inner" />
              <input placeholder="PIN" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} className="w-1/2 p-4 rounded-2xl bg-white/80 border-none shadow-inner" />
            </div>
            <input placeholder="Active Phone Number" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className="w-full p-4 rounded-2xl bg-white/80 border-none shadow-inner" />
            <button onClick={handleAddAddress} className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold shadow-xl">Save & Sync</button>
          </div>
        )}

        <div className="space-y-4">
          {addresses.map(a => (
            <div key={a.id} className="flex justify-between p-4 bg-white/40 rounded-2xl border border-white/20">
              <div>
                <p className="text-sm font-bold text-gray-700">{a.street}</p>
                <p className="text-xs text-gray-400">{a.city}, {a.zip} | {a.phone}</p>
              </div>
              <button onClick={() => deleteAddr(a.id)} className="text-red-400">🗑️</button>
            </div>
          ))}
        </div>
      </div>

      {/* 📦 ORDERS LIST */}
      <h2 className="text-xl font-black mb-4 px-2 text-gray-800">Order History</h2>
      <div className="space-y-4">
        {orders.map(o => {
          const current = steps.indexOf(o.status);
          const progress = ((current + 1) / steps.length) * 100;
          return (
            <div key={o.id} className="bg-white/70 backdrop-blur-md p-5 rounded-[2rem] border border-white shadow-xl">
              <div className="flex gap-4 mb-4">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden border border-white/50">
                  <img src={o.items?.[0]?.image} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-gray-800 line-clamp-1">{o.items?.[0]?.name}</h3>
                  <p className="text-purple-600 font-black text-lg">₹{o.total}</p>
                  <div className="inline-block px-3 py-1 bg-white rounded-full text-[10px] font-bold shadow-sm uppercase tracking-widest text-gray-500">
                    {o.status}
                  </div>
                </div>
              </div>

              {/* Glassy Progress Bar */}
              <div className="h-2 w-full bg-gray-200/50 rounded-full mb-4 overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>

              <div className="flex justify-between">
                <button onClick={() => router.push(`/track/${o.id}`)} className="text-sm font-bold text-gray-700 underline decoration-purple-400 decoration-2">Details</button>
                <button onClick={() => { setSelectedOrder(o); setShowHelp(true); }} className="px-6 py-2 bg-black text-white rounded-xl text-xs font-bold">Help & Returns</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔮 PREMIUM HELP & RETURN MODAL */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-end sm:items-center justify-center z-50 animate-in slide-in-from-bottom duration-300">
          <div className="bg-white/90 backdrop-blur-2xl w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl border border-white">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 sm:hidden" onClick={() => setShowHelp(false)} />
            <h3 className="text-xl font-black mb-2">Order Support</h3>
            <p className="text-gray-400 text-xs mb-6 uppercase tracking-widest font-bold">ID: #{selectedOrder?.id.slice(-6)}</p>

            <div className="space-y-4">
              {/* Return Section */}
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <h4 className="font-bold text-purple-700 mb-2">Easy Return Policy</h4>
                <select 
                  value={returnReason} 
                  onChange={e => setReturnReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border-none text-sm shadow-sm"
                >
                  <option value="">Select Reason for Return</option>
                  <option>Defective/Damaged Product</option>
                  <option>Wrong Item Received</option>
                  <option>Size/Fit Issue</option>
                  <option>Quality not as expected</option>
                </select>
                <button 
                  onClick={handleReturnRequest}
                  className="w-full mt-3 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200"
                >
                  Submit Return Request
                </button>
              </div>

              {/* Cancel Section */}
              {selectedOrder?.status === "Pending" && (
                <button onClick={async () => {
                  await updateDoc(doc(db, "orders", selectedOrder.id), { status: "Cancelled" });
                  alert("Order Cancelled ✅"); setShowHelp(false);
                }} className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-bold">Cancel Order</button>
              )}
              
              <button onClick={() => setShowHelp(false)} className="w-full py-2 text-gray-400 text-sm">Dismiss</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

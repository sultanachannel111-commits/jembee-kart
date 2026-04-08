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
  
  // 🔥 Phone number initial state khali rakhi hai taaki 0 na aaye
  const [newAddress, setNewAddress] = useState({ street: "", city: "", zip: "", phone: "" });
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  const [showHelp, setShowHelp] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnReason, setReturnReason] = useState("");

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

        // Orders fetch
        const oSnap = await getDocs(collection(db, "orders"));
        const userOrders = [];
        oSnap.forEach((d) => {
          if (d.data().userId === u.uid) userOrders.push({ id: d.id, ...d.data() });
        });
        setOrders(userOrders.sort((a, b) => b.createdAt - a.createdAt));

        // Addresses fetch (Syncing with Checkout)
        const q = query(collection(db, "addresses"), where("userId", "==", u.uid));
        const aSnap = await getDocs(q);
        const addrList = [];
        aSnap.forEach((d) => addrList.push({ id: d.id, ...d.data() }));
        setAddresses(addrList);

      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    });
    return () => unsub();
  }, [mounted, router]);

  // --- 🔥 MOBILE NUMBER FIX (Leading 0 Removal) ---
  const handlePhoneInput = (e) => {
    let val = e.target.value.replace(/\D/g, ""); // Sirf numbers
    if (val.startsWith("0")) val = val.substring(1); // 0 hatao
    setNewAddress({ ...newAddress, phone: val });
  };

  const saveAddress = async () => {
    if (!newAddress.street || newAddress.phone.length < 10) return alert("Valid Address & 10-digit Phone required");
    try {
      const docRef = await addDoc(collection(db, "addresses"), {
        ...newAddress,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      setAddresses([{ id: docRef.id, ...newAddress }, ...addresses]);
      setNewAddress({ street: "", city: "", zip: "", phone: "" });
      setShowAddressForm(false);
    } catch (e) { alert("Error"); }
  };

  // --- 🚫 CANCEL ORDER LOGIC ---
  const cancelOrder = async (orderId) => {
    if (confirm("Do you want to cancel this order?")) {
      await updateDoc(doc(db, "orders", orderId), { status: "Cancelled" });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: "Cancelled" } : o));
      setShowHelp(false);
      alert("Order Cancelled ✅");
    }
  };

  if (!mounted || loading) return <div className="h-screen flex items-center justify-center bg-white font-black text-purple-600">JEMBEE SYNC...</div>;

  return (
    <div className="max-w-md mx-auto p-4 pb-28 bg-[#fdfbff] min-h-screen font-sans">
      
      {/* 👤 Header (Glassmorphism) */}
      <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl shadow-purple-100/50 mb-6 border border-white text-center">
        <div className="w-20 h-20 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl text-white font-bold shadow-lg ring-4 ring-white">
          {name.charAt(0).toUpperCase()}
        </div>
        {!editing ? (
          <h1 className="text-2xl font-black text-gray-800" onClick={() => setEditing(true)}>{name} ✏️</h1>
        ) : (
          <div className="flex gap-2">
            <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border-none bg-gray-100 rounded-xl text-center" />
            <button onClick={async () => { await setDoc(doc(db, "users", user.uid), { name }, { merge: true }); setEditing(false); }} className="bg-black text-white px-4 rounded-xl">✓</button>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
        <button onClick={() => auth.signOut()} className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-red-400 bg-red-50 px-6 py-2 rounded-full">Logout</button>
      </div>

      {/* 🏠 Sync Addresses */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-lg mb-6 border border-white">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-black text-gray-700">Saved Addresses</h2>
          <button onClick={() => setShowAddressForm(!showAddressForm)} className="w-10 h-10 bg-black text-white rounded-full shadow-lg flex items-center justify-center">
            {showAddressForm ? "×" : "+"}
          </button>
        </div>

        {showAddressForm && (
          <div className="space-y-3 mb-5 animate-in fade-in slide-in-from-top-2">
            <input placeholder="Full Street / Landmark" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm" />
            <div className="flex gap-2">
              <input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-1/2 p-4 bg-gray-50 border-none rounded-2xl text-sm" />
              <input placeholder="Zip" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} className="w-1/2 p-4 bg-gray-50 border-none rounded-2xl text-sm" />
            </div>
            <input placeholder="Phone (Auto-hides 0)" type="tel" value={newAddress.phone} onChange={handlePhoneInput} className="w-full p-4 bg-purple-50 border-none rounded-2xl text-sm font-bold text-purple-700" />
            <button onClick={saveAddress} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-purple-100">SYNC TO CHECKOUT</button>
          </div>
        )}

        <div className="space-y-4">
          {addresses.map(a => (
            <div key={a.id} className="flex justify-between items-center p-4 bg-white/50 rounded-2xl border border-gray-50">
              <div className="text-xs">
                <p className="font-black text-gray-800">{a.street}</p>
                <p className="text-gray-400 font-bold">{a.city}, {a.zip} • {a.phone}</p>
              </div>
              <button onClick={() => deleteAddr(a.id)} className="opacity-20 hover:opacity-100">🗑️</button>
            </div>
          ))}
        </div>
      </div>

      {/* 📦 Premium Order Cards */}
      <h2 className="font-black mb-4 px-2 text-xl text-gray-800">Your Orders</h2>
      <div className="space-y-4">
        {orders.map(o => (
          <div key={o.id} className="bg-white p-5 rounded-[2.2rem] shadow-xl shadow-gray-100 border border-white flex gap-4 items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
              <img src={o.items?.[0]?.image || "/placeholder.png"} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-gray-800 truncate w-32 uppercase tracking-tighter">{o.items?.[0]?.name}</p>
              <p className="text-purple-600 font-black text-lg">₹{o.total}</p>
              <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase ${o.status === 'Cancelled' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>{o.status || "Pending"}</span>
            </div>
            <button onClick={() => { setSelectedOrder(o); setShowHelp(true); }} className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center text-xs shadow-lg">
              ?
            </button>
          </div>
        ))}
      </div>

      {/* 🔮 HELP & CANCEL MODAL */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-end justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white w-full rounded-t-[3rem] p-8 animate-in slide-in-from-bottom duration-500 shadow-2xl">
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-8" />
            <h3 className="text-xl font-black text-center mb-6">Order Support</h3>
            
            <div className="space-y-4">
              {(selectedOrder?.status === "Pending" || selectedOrder?.status === "Placed") && (
                <button onClick={() => cancelOrder(selectedOrder.id)} className="w-full py-5 bg-red-50 text-red-600 rounded-2xl font-black text-sm uppercase tracking-widest">
                  🚫 Cancel Order
                </button>
              )}
              
              <div className="p-5 bg-purple-50 rounded-3xl border border-purple-100">
                <p className="text-[10px] font-black text-purple-400 uppercase mb-3 tracking-widest">Return Policy</p>
                <select onChange={(e) => setReturnReason(e.target.value)} className="w-full p-4 rounded-xl bg-white border-none text-xs font-bold mb-4">
                  <option>Select Return Reason</option>
                  <option>Defective Product</option>
                  <option>Wrong Item Received</option>
                  <option>Quality Issue</option>
                </select>
                <button className="w-full py-4 bg-purple-600 text-white rounded-xl font-black text-xs">Request Return</button>
              </div>

              <button onClick={() => setShowHelp(false)} className="w-full py-3 text-gray-300 font-black text-[10px] uppercase">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

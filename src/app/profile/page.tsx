"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  updateDoc
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
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Syncing fields with Checkout Page
  const [newAddress, setNewAddress] = useState({
    name: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    zip: "",
    phone: ""
  });

  const [showHelp, setShowHelp] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const router = useRouter();

  const reasons = [
    "Product is damaged",
    "Different from images",
    "Size/Fit issue",
    "Quality not as expected",
    "Other"
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }
      setUser(u);

      try {
        const userSnap = await getDoc(doc(db, "users", u.uid));
        setName(userSnap.exists() ? userSnap.data().name : u.email?.split("@")[0]);

        // FETCH ORDERS
        const oSnap = await getDocs(query(collection(db, "orders"), where("userId", "==", u.uid)));
        const userOrders = [];
        oSnap.forEach((d) => userOrders.push({ id: d.id, ...d.data() }));
        setOrders(userOrders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));

        // FETCH ADDRESSES
        const aSnap = await getDocs(query(collection(db, "addresses"), where("userId", "==", u.uid)));
        const addrList = [];
        aSnap.forEach((d) => addrList.push({ id: d.id, ...d.data() }));
        setAddresses(addrList.reverse());

      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [mounted, router]);

  const saveAddress = async () => {
    if (!newAddress.street || !newAddress.zip || newAddress.phone.length < 10 || !newAddress.name) {
      return alert("Please fill Name, Street, Zip and a valid Phone number.");
    }

    try {
      const addrData = {
        ...newAddress,
        userId: user.uid,
        createdAt: new Date()
      };

      const ref = await addDoc(collection(db, "addresses"), addrData);
      setAddresses([{ id: ref.id, ...addrData }, ...addresses]);
      
      setNewAddress({ name: "", street: "", landmark: "", city: "", state: "", zip: "", phone: "" });
      setShowAddressForm(false);
    } catch (err) {
      alert("Error saving address");
    }
  };

  const deleteAddr = async (id) => {
    if (confirm("Delete this address?")) {
      await deleteDoc(doc(db, "addresses", id));
      setAddresses(addresses.filter(a => a.id !== id));
    }
  };

  const handleOrderAction = async (orderId, actionType) => {
    if (actionType === "CANCEL") {
      if (!confirm("Cancel this order?")) return;
      await updateDoc(doc(db, "orders", orderId), { status: "CANCELLED" });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: "CANCELLED" } : o));
      setShowHelp(false);
    }

    if (actionType === "RETURN_SUBMIT") {
      const finalReason = returnReason === "Other" ? customReason : returnReason;
      if (!finalReason) return alert("Please provide a reason");

      await updateDoc(doc(db, "orders", orderId), { status: "RETURN_REQUESTED", returnReason: finalReason });
      await addDoc(collection(db, "returns"), { orderId, userId: user.uid, reason: finalReason, status: "PENDING", createdAt: new Date() });

      setOrders(orders.map(o => o.id === orderId ? { ...o, status: "RETURN_REQUESTED" } : o));
      alert("Return request submitted ✅");
      setShowReturnForm(false);
    }
  };

  if (!mounted || loading) return <div className="h-screen flex items-center justify-center bg-[#0f172a] text-white italic animate-pulse font-black">INITIALISING PROFILE...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 pb-24 font-sans max-w-md mx-auto">
      
      {/* 👤 USER INFO */}
      <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] text-center mb-6 backdrop-blur-xl">
        <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-black shadow-lg">
          {name.charAt(0).toUpperCase()}
        </div>
        <h1 className="font-black text-xl tracking-tight italic uppercase">{name}</h1>
        <p className="text-xs text-white/40 font-mono tracking-widest uppercase">{user?.email}</p>
        <button onClick={() => auth.signOut()} className="mt-4 text-[10px] font-black text-red-400 border border-red-400/20 px-4 py-1 rounded-full uppercase hover:bg-red-400/10 transition-all">
          Logout Securely
        </button>
      </div>

      {/* 📍 ADDRESSES */}
      <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Saved Addresses</h2>
          <button onClick={() => setShowAddressForm(!showAddressForm)} className="bg-white text-black w-8 h-8 rounded-2xl flex items-center justify-center font-black shadow-lg">
            {showAddressForm ? "×" : "+"}
          </button>
        </div>

        {showAddressForm && (
          <div className="space-y-3 mb-6 bg-white/5 p-4 rounded-3xl border border-white/5">
            <input placeholder="Full Name" value={newAddress.name} onChange={(e) => setNewAddress({...newAddress, name: e.target.value})} className="w-full bg-black/40 border border-white/10 p-3 rounded-2xl text-xs outline-none focus:border-indigo-500" />
            <input placeholder="Flat / Street / House No." value={newAddress.street} onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} className="w-full bg-black/40 border border-white/10 p-3 rounded-2xl text-xs outline-none focus:border-indigo-500" />
            <input placeholder="Landmark (Optional)" value={newAddress.landmark} onChange={(e) => setNewAddress({...newAddress, landmark: e.target.value})} className="w-full bg-black/40 border border-white/10 p-3 rounded-2xl text-xs outline-none focus:border-indigo-500" />
            <div className="flex gap-2">
              <input placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className="w-1/2 bg-black/40 border border-white/10 p-3 rounded-2xl text-xs outline-none focus:border-indigo-500" />
              <input placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} className="w-1/2 bg-black/40 border border-white/10 p-3 rounded-2xl text-xs outline-none focus:border-indigo-500" />
            </div>
            <div className="flex gap-2">
              <input placeholder="Pincode" value={newAddress.zip} onChange={(e) => setNewAddress({...newAddress, zip: e.target.value})} className="w-1/2 bg-black/40 border border-white/10 p-3 rounded-2xl text-xs outline-none focus:border-indigo-500" />
              <input placeholder="Phone Number" value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} className="w-1/2 bg-black/40 border border-white/10 p-3 rounded-2xl text-xs outline-none focus:border-indigo-500" />
            </div>
            <button onClick={saveAddress} className="w-full bg-indigo-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
              Save New Location 📍
            </button>
          </div>
        )}

        <div className="space-y-4">
          {addresses.map(a => (
            <div key={a.id} className="border-b border-white/5 last:border-0 pb-4 flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-black italic">{a.name}</p>
                <p className="text-[11px] text-white/50 leading-relaxed">{a.street}, {a.landmark && `${a.landmark}, `} {a.city}, {a.state} - {a.zip}</p>
                <p className="text-[10px] text-indigo-400 mt-1 font-bold">📞 {a.phone}</p>
              </div>
              <button onClick={() => deleteAddr(a.id)} className="text-[9px] font-black text-red-400/50 uppercase tracking-tighter ml-4">Remove</button>
            </div>
          ))}
          {addresses.length === 0 && !showAddressForm && <p className="text-center text-white/20 text-xs py-4">No addresses saved yet.</p>}
        </div>
      </div>

      {/* 📦 ORDERS SECTION */}
      <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 ml-6 mb-4">Recent Transactions</h2>
      <div className="space-y-3">
        {orders.map(o => (
          <div key={o.id} className="bg-white/5 border border-white/5 p-4 rounded-[2rem] flex items-center gap-4 group active:bg-white/10 transition-all">
            <img src={o.items?.[0]?.image || "/placeholder.png"} className="w-14 h-14 rounded-2xl object-cover bg-white/10" alt="product" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[11px] truncate uppercase tracking-tight">{o.items?.[0]?.name}</p>
              <p className="text-indigo-400 font-black text-sm italic">₹{o.total}</p>
              <div className="flex items-center gap-2 mt-1">
                 <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${o.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'} uppercase tracking-tighter`}>{o.status}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
               <button onClick={() => router.push(`/track/${o.id}`)} className="bg-white text-black text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-tighter active:scale-90 transition-all shadow-lg">Track</button>
               <button onClick={() => { setSelectedOrder(o); setShowHelp(true); }} className="bg-white/5 border border-white/10 text-white w-full h-8 rounded-xl flex items-center justify-center font-black">?</button>
            </div>
          </div>
        ))}
      </div>

      {/* MODALS (Help & Return) */}
      {/* ... (Same logic as your original help modal, styled to match) */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[100] p-6">
          <div className="bg-[#0f172a] border border-white/10 p-8 rounded-[3rem] w-full max-w-xs shadow-2xl">
            <h3 className="font-black mb-6 text-center uppercase tracking-widest text-white/40 italic">Manage Order</h3>
            {(selectedOrder?.status === "PENDING" || selectedOrder?.status === "PLACED") && (
              <button onClick={() => handleOrderAction(selectedOrder.id, "CANCEL")} className="w-full bg-red-500 text-white py-5 mb-3 rounded-[2rem] font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-lg shadow-red-500/20">Cancel Shipment</button>
            )}
            {selectedOrder?.status === "DELIVERED" && (
              <button onClick={() => { setShowReturnForm(true); setShowHelp(false); }} className="w-full bg-amber-500 text-white py-5 mb-3 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-lg shadow-amber-500/20">Return Items</button>
            )}
            <button onClick={() => setShowHelp(false)} className="w-full bg-white/5 text-white/40 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest border border-white/10">Dismiss</button>
          </div>
        </div>
      )}

      {/* Return form details kept same but styled to match dark theme */}
      {showReturnForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[100] p-6">
          <div className="bg-[#0f172a] border border-white/10 p-8 rounded-[3rem] w-full max-w-sm shadow-2xl">
            <h3 className="font-black mb-6 text-center uppercase tracking-widest text-white/40 italic text-sm">Reason for Return</h3>
            <div className="space-y-2">
              {reasons.map((r) => (
                <button key={r} onClick={() => setReturnReason(r)} className={`block w-full p-4 border rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all ${returnReason === r ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-white/5 border-white/10 text-white/50"}`}>{r}</button>
              ))}
            </div>
            {returnReason === "Other" && <textarea placeholder="Describe the issue..." value={customReason} onChange={(e) => setCustomReason(e.target.value)} className="w-full bg-black/40 border border-white/10 p-4 mt-3 rounded-2xl text-xs text-white outline-none focus:border-indigo-500" rows={3} />}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowReturnForm(false)} className="flex-1 bg-white/5 py-5 rounded-[2rem] font-black uppercase text-[9px] tracking-widest border border-white/10">Back</button>
              <button onClick={() => handleOrderAction(selectedOrder.id, "RETURN_SUBMIT")} className="flex-[2] bg-green-600 py-5 rounded-[2rem] font-black uppercase text-[9px] tracking-widest shadow-lg shadow-green-600/20">Submit Request</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

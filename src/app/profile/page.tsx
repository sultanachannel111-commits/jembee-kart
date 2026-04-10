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
  
  // Modal States
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

  // 🔥 FAST DELETE (Address turant hatega UI se)
  const removeAddress = async (id) => {
    const originalAddresses = [...addresses];
    setAddresses(addresses.filter(a => a.id !== id));
    try {
      await deleteDoc(doc(db, "addresses", id));
    } catch (err) {
      setAddresses(originalAddresses);
      alert("Delete failed!");
    }
  };

  const handleOrderAction = async (orderId, actionType) => {
    if (actionType === "CANCEL") {
      if (!confirm("Are you sure you want to cancel?")) return;
      await updateStatus(orderId, "Cancelled");
    } else if (actionType === "RETURN_SUBMIT") {
      const finalReason = returnReason === "Other" ? customReason : returnReason;
      if (!finalReason) return alert("Please select or write a reason");
      await updateStatus(orderId, "Return Requested", finalReason);
    }
  };

  const updateStatus = async (orderId, status, reason = "") => {
    try {
      const updateData = { status };
      if (reason) updateData.returnReason = reason;
      
      await updateDoc(doc(db, "orders", orderId), updateData);
      setOrders(orders.map(o => o.id === orderId ? { ...o, ...updateData } : o));
      setShowHelp(false);
      setShowReturnForm(false);
      setReturnReason("");
      setCustomReason("");
      alert(`Update successful: ${status}`);
    } catch (err) { alert("Action failed."); }
  };

  const saveAddress = async () => {
    if (!newAddress.street || !newAddress.zip || newAddress.phone.length < 10) return alert("Fill details!");
    const ref = await addDoc(collection(db, "addresses"), { ...newAddress, userId: user.uid });
    setAddresses([{ id: ref.id, ...newAddress }, ...addresses]);
    setNewAddress({ street: "", city: "", zip: "", phone: "" });
    setShowAddressForm(false);
  };

  if (!mounted || loading) return <div className="h-screen flex items-center justify-center font-bold text-black bg-white tracking-widest uppercase animate-pulse">JEMBEE SYNC...</div>;

  return (
    <div className="max-w-md mx-auto p-4 pb-24 bg-gray-50 min-h-screen font-sans">
      
      {/* 👤 PROFILE */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm mb-6 text-center border border-gray-100">
        <h1 className="text-2xl font-bold uppercase tracking-tight">{name}</h1>
        <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
      </div>

      {/* 🏠 ADDRESSES */}
      <div className="bg-white p-5 rounded-[2.5rem] mb-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="font-bold text-lg">My Addresses</h2>
          <button onClick={() => setShowAddressForm(!showAddressForm)} className="bg-black text-white w-8 h-8 rounded-full font-bold shadow-lg shadow-black/10">+</button>
        </div>

        {showAddressForm && (
          <div className="space-y-3 mb-4 bg-gray-50 p-4 rounded-3xl border border-gray-100">
            <input placeholder="Street/Area" value={newAddress.street} onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} className="w-full p-3 rounded-xl ring-1 ring-gray-200 outline-none focus:ring-black" />
            <div className="flex gap-2">
              <input placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className="w-1/2 p-3 rounded-xl ring-1 ring-gray-200 outline-none focus:ring-black" />
              <input placeholder="Zip Code" value={newAddress.zip} onChange={(e) => setNewAddress({...newAddress, zip: e.target.value})} className="w-1/2 p-3 rounded-xl ring-1 ring-gray-200 outline-none focus:ring-black" />
            </div>
            <input placeholder="Mobile Number" value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} className="w-full p-3 rounded-xl ring-1 ring-gray-200 outline-none focus:ring-black" />
            <button onClick={saveAddress} className="bg-black text-white w-full py-3.5 rounded-xl font-black uppercase tracking-wide">Save Address</button>
          </div>
        )}

        <div className="divide-y divide-gray-50">
          {addresses.map(a => (
            <div key={a.id} className="py-4 flex justify-between items-start group">
              <div className="text-sm">
                <p className="font-bold text-slate-800 leading-tight">{a.street}</p>
                <p className="text-gray-500 font-medium">{a.city}, {a.zip}</p>
                <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">📞 {a.phone}</p>
              </div>
              <button onClick={() => removeAddress(a.id)} className="text-red-400 text-xs font-bold uppercase tracking-tighter pt-1">Remove</button>
            </div>
          ))}
        </div>
      </div>

      {/* 📦 ORDERS */}
      <h2 className="font-bold text-lg mb-4 px-2">Order History</h2>
      {orders.map(o => (
        <div key={o.id} className="bg-white p-4 rounded-[2rem] mb-3 flex gap-4 items-center shadow-sm border border-gray-50">
          <img src={o.items?.[0]?.image || "/placeholder.png"} className="w-16 h-16 rounded-2xl object-cover bg-gray-50" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black truncate uppercase text-slate-800">{o.items?.[0]?.name}</p>
            <p className="font-bold text-black">₹{o.total}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black tracking-tighter uppercase ${
              o.status?.toUpperCase() === 'CANCELLED' ? 'bg-red-50 text-red-500' : 
              o.status?.toUpperCase() === 'DELIVERED' ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-600'
            }`}>{o.status}</span>
          </div>
          
          {/* TRACK BUTTON (DO NOT REMOVE) */}
          <button onClick={() => router.push(`/track/${o.id}`)} className="bg-gray-100 text-slate-900 px-3 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm">Track</button>
          
          <button onClick={() => { setSelectedOrder(o); setShowHelp(true); }} className="bg-black text-white w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-black/5">?</button>
        </div>
      ))}

      {/* 🛠 MODAL: CANCEL/RETURN OPTIONS */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[99] p-6">
          <div className="bg-white p-6 rounded-[2.5rem] w-full max-w-xs shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-black text-xl mb-6 text-center text-slate-800 tracking-tight uppercase">Order Help</h3>
            <div className="space-y-3">
              {(selectedOrder?.status?.toUpperCase() === "PENDING" || selectedOrder?.status?.toUpperCase() === "PLACED") && (
                <button onClick={() => handleOrderAction(selectedOrder.id, "CANCEL")} className="w-full bg-red-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-red-100 uppercase">Cancel Order</button>
              )}
              {selectedOrder?.status?.toUpperCase() === "DELIVERED" && (
                <button onClick={() => { setShowReturnForm(true); setShowHelp(false); }} className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-orange-100 uppercase">Return Order</button>
              )}
              <button onClick={() => setShowHelp(false)} className="w-full bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 📝 MODAL: RETURN REASON FORM */}
      {showReturnForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-white p-6 rounded-[2.5rem] w-full max-w-xs shadow-2xl border border-gray-100">
            <h3 className="font-black text-lg mb-5 text-center text-slate-800 uppercase">Select Reason</h3>
            <div className="space-y-2 mb-4">
              {reasons.map((r) => (
                <button 
                  key={r}
                  onClick={() => setReturnReason(r)}
                  className={`w-full p-4 rounded-2xl text-left text-xs font-black transition-all ${returnReason === r ? 'bg-black text-white ring-4 ring-black/5' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}
                >
                  {r}
                </button>
              ))}
            </div>

            {returnReason === "Other" && (
              <textarea 
                placeholder="Write reason here..."
                className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm mb-4 outline-none focus:ring-2 focus:ring-black"
                rows="3"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            )}

            <div className="flex gap-2">
              <button onClick={() => setShowReturnForm(false)} className="w-1/3 bg-gray-50 py-4 rounded-2xl font-bold text-gray-400 uppercase text-[10px]">Back</button>
              <button onClick={() => handleOrderAction(selectedOrder.id, "RETURN_SUBMIT")} className="w-2/3 bg-black text-white py-4 rounded-2xl font-black uppercase text-xs tracking-tighter">Submit Return</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

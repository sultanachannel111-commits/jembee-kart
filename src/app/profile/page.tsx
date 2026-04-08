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
  where
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false); // 🔥 Crash rokne ke liye
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [orders, setOrders] = useState([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);

  // 🏠 Address States
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({ street: "", city: "", zip: "" });
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [reason, setReason] = useState("");

  const router = useRouter();

  // 🛠️ 1. MOUNT CHECK (Next.js Hydration Fix)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 🛠️ 2. LOAD DATA
  useEffect(() => {
    if (!mounted) return;

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }
      setUser(u);

      try {
        // Load Profile Name
        const userRef = doc(db, "users", u.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setName(snap.data().name);
        } else {
          setName(u.email?.split("@")[0] || "User");
        }

        // Load Orders
        const snapOrders = await getDocs(collection(db, "orders"));
        const arr = [];
        snapOrders.forEach(d => {
          const data = d.data();
          if (data.userId === u.uid) {
            arr.push({ id: d.id, ...data });
          }
        });
        setOrders(arr);

        // Load Addresses
        const q = query(collection(db, "addresses"), where("userId", "==", u.uid));
        const addrSnap = await getDocs(q);
        const addrList = [];
        addrSnap.forEach(doc => addrList.push({ id: doc.id, ...doc.data() }));
        setAddresses(addrList);

      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [mounted, router]);

  // 🏠 ADDRESS FUNCTIONS
  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city) return alert("Please fill details");
    try {
      const docRef = await addDoc(collection(db, "addresses"), {
        ...newAddress,
        userId: user.uid
      });
      setAddresses([...addresses, { id: docRef.id, ...newAddress }]);
      setNewAddress({ street: "", city: "", zip: "" });
      setShowAddressForm(false);
    } catch (e) {
      alert("Error adding address");
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await deleteDoc(doc(db, "addresses", id));
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (e) {
      alert("Error deleting address");
    }
  };

  // 🚀 RENDER LOGIC
  if (!mounted || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white font-bold">
        Loading...
      </div>
    );
  }

  const steps = ["Pending", "Placed", "Shipped", "Out for Delivery", "Delivered"];

  return (
    <div className="p-4 pb-24 bg-gradient-to-br from-purple-100 to-white min-h-screen">
      
      {/* 👤 PROFILE */}
      <div className="bg-white p-6 rounded-3xl mb-5 shadow-sm text-center">
        {!editing ? (
          <>
            <h1 className="text-2xl font-bold">👤 {name}</h1>
            <button onClick={() => setEditing(true)} className="text-blue-600 text-sm mt-1">Edit Name</button>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} className="border p-2 rounded-xl text-center" />
            <button onClick={async () => {
              await setDoc(doc(db, "users", user.uid), { name }, { merge: true });
              setEditing(false);
            }} className="bg-green-600 text-white py-2 rounded-xl">Save</button>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">{user?.email}</p>
        <button onClick={() => auth.signOut()} className="mt-4 bg-red-50 text-red-600 px-6 py-2 rounded-2xl font-bold text-xs">LOGOUT</button>
      </div>

      {/* 🏠 ADDRESS SECTION */}
      <div className="bg-white p-5 rounded-3xl mb-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">My Addresses 🏠</h2>
          <button onClick={() => setShowAddressForm(!showAddressForm)} className="text-blue-600 font-bold">
            {showAddressForm ? "✕" : "+ Add"}
          </button>
        </div>

        {showAddressForm && (
          <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-2xl">
            <input placeholder="Street/Area" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full p-2 border rounded-xl text-sm" />
            <div className="flex gap-2">
              <input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-1/2 p-2 border rounded-xl text-sm" />
              <input placeholder="Zip" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} className="w-1/2 p-2 border rounded-xl text-sm" />
            </div>
            <button onClick={handleAddAddress} className="w-full bg-blue-600 text-white py-2 rounded-xl">Save Address</button>
          </div>
        )}

        <div className="space-y-3">
          {addresses.length === 0 ? <p className="text-gray-400 text-xs">No address saved.</p> : (
            addresses.map(a => (
              <div key={a.id} className="flex justify-between items-center border-b border-gray-50 pb-2">
                <div className="text-sm">
                  <p className="font-medium text-gray-700">{a.street}</p>
                  <p className="text-gray-400 text-xs">{a.city}, {a.zip}</p>
                </div>
                <button onClick={() => handleDeleteAddress(a.id)} className="text-red-400 text-xs">Delete</button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 📦 ORDERS SECTION */}
      <h2 className="text-xl font-bold mb-4 ml-1">My Orders 📦</h2>
      {orders.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl text-center text-gray-400">No orders yet</div>
      ) : (
        orders.map(o => {
          const current = steps.indexOf(o.status || "Pending");
          return (
            <div key={o.id} className="bg-white p-4 rounded-3xl mb-4 shadow-sm border border-gray-50">
              <div className="flex gap-4">
                <img src={o.items?.[0]?.image} className="w-16 h-16 rounded-2xl object-cover border" />
                <div>
                  <p className="font-bold text-sm text-gray-800 line-clamp-1">{o.items?.[0]?.name}</p>
                  <p className="text-green-600 font-bold">₹{o.total}</p>
                  <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold uppercase">{o.status}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-5 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all duration-500" 
                  style={{ width: `${(current / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between mt-4">
                <button onClick={() => router.push(`/track/${o.id}`)} className="text-blue-600 text-sm font-bold">Track Order</button>
                <button onClick={() => { setSelectedOrder(o); setShowHelp(true); }} className="text-gray-300 text-sm">Help</button>
              </div>
            </div>
          );
        })
      )}

      {/* HELP MODAL */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full rounded-3xl p-6 shadow-2xl">
            <h3 className="font-bold text-lg mb-4 text-center">Order Support</h3>
            <button onClick={async () => {
              await updateDoc(doc(db, "orders", selectedOrder.id), { status: "Cancelled" });
              alert("Order Cancelled ✅");
              setShowHelp(false);
            }} className="w-full bg-red-100 text-red-600 p-4 rounded-2xl font-bold mb-3">Cancel Order</button>
            
            <button onClick={() => setShowHelp(false)} className="w-full text-gray-400 font-medium py-2">Close</button>
          </div>
        </div>
      )}

    </div>
  );
}

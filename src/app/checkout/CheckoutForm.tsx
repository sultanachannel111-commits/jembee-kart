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
  const [user, setUser] = useState(null);
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
  const [issue, setIssue] = useState("");

  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        return router.push("/login");
      }
      setUser(u);

      // 👤 Load Profile Name
      try {
        const userRef = doc(db, "users", u.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setName(snap.data().name);
        } else {
          setName(u.email?.split("@")[0] || "User");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      }

      // 📦 Load Orders (Optimized Query)
      try {
        const snapOrders = await getDocs(collection(db, "orders"));
        const arr = [];
        snapOrders.forEach(d => {
          const data = d.data();
          if (data.userId === u.uid) {
            arr.push({ id: d.id, ...data });
          }
        });
        setOrders(arr);
      } catch (err) {
        console.error("Error loading orders:", err);
      }

      // 🏠 Load Addresses
      fetchAddresses(u.uid);
    });

    return () => unsub();
  }, [router]);

  const fetchAddresses = async (uid) => {
    try {
      const q = query(collection(db, "addresses"), where("userId", "==", uid));
      const snap = await getDocs(q);
      const addrList = [];
      snap.forEach(doc => addrList.push({ id: doc.id, ...doc.data() }));
      setAddresses(addrList);
    } catch (err) {
      console.error("Error fetching addresses:", err);
    }
  };

  // 🏠 Address Handlers
  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city) return alert("Please fill details");
    if (!user) return;

    await addDoc(collection(db, "addresses"), {
      ...newAddress,
      userId: user.uid
    });
    setNewAddress({ street: "", city: "", zip: "" });
    setShowAddressForm(false);
    fetchAddresses(user.uid);
  };

  const handleDeleteAddress = async (id) => {
    await deleteDoc(doc(db, "addresses", id));
    fetchAddresses(user.uid);
  };

  // 🚚 Helpers
  const getDeliveryDate = (order) => {
    if (!order.createdAt?.toDate) return "N/A";
    const d = order.createdAt.toDate();
    d.setDate(d.getDate() + 5);
    return d.toDateString();
  };

  const getTrackingText = (status) => {
    const texts = {
      "Pending": "Order placed, preparing 📦",
      "Placed": "Order confirmed ✅",
      "Shipped": "Shipped from warehouse 🚚",
      "Out for Delivery": "Out for delivery 🛵",
      "Delivered": "Delivered successfully 🎉"
    };
    return texts[status] || "Processing...";
  };

  const getDates = (order) => {
    if (!order.createdAt?.toDate) return {};
    const base = order.createdAt.toDate();
    return {
      ordered: base.toDateString(),
      shipped: new Date(base.getTime() + 2 * 86400000).toDateString(),
      out: new Date(base.getTime() + 4 * 86400000).toDateString(),
      delivered: new Date(base.getTime() + 5 * 86400000).toDateString()
    };
  };

  const steps = ["Pending", "Placed", "Shipped", "Out for Delivery", "Delivered"];

  if (!user) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="p-4 pb-24 bg-gradient-to-br from-purple-200 via-pink-100 to-white min-h-screen">
      
      {/* 👤 Profile Section */}
      <div className="bg-white p-5 rounded-2xl mb-5 shadow text-center">
        {!editing ? (
          <>
            <h1 className="text-2xl font-bold">👤 {name}</h1>
            <button onClick={() => setEditing(true)} className="text-blue-600 text-sm mt-1">Edit Name</button>
          </>
        ) : (
          <>
            <input 
               value={name} 
               onChange={(e) => setName(e.target.value)} 
               className="border p-2 rounded w-full text-center" 
            />
            <button 
              onClick={async () => {
                await setDoc(doc(db, "users", user.uid), { name }, { merge: true });
                setEditing(false);
              }} 
              className="bg-green-600 text-white px-4 py-1 rounded mt-2 w-full"
            >
              Save Name
            </button>
          </>
        )}
        <p className="text-sm text-gray-500 mt-2">{user?.email}</p>
        <button onClick={() => auth.signOut()} className="mt-3 bg-red-500 text-white px-5 py-2 rounded-xl">Logout</button>
      </div>

      {/* 🏠 Address Section */}
      <div className="bg-white p-5 rounded-2xl mb-5 shadow">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">Saved Addresses 🏠</h2>
          <button onClick={() => setShowAddressForm(!showAddressForm)} className="text-blue-600 text-sm font-bold">
            {showAddressForm ? "Cancel" : "+ Add New"}
          </button>
        </div>

        {showAddressForm && (
          <div className="space-y-2 mb-4 p-3 border rounded-xl bg-gray-50">
            <input placeholder="Street/Area" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full p-2 border rounded text-sm" />
            <div className="flex gap-2">
              <input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-1/2 p-2 border rounded text-sm" />
              <input placeholder="Zip Code" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} className="w-1/2 p-2 border rounded text-sm" />
            </div>
            <button onClick={handleAddAddress} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm">Save Address</button>
          </div>
        )}

        {addresses.length === 0 ? <p className="text-gray-400 text-xs">No addresses saved.</p> : (
          <div className="space-y-3">
            {addresses.map(addr => (
              <div key={addr.id} className="flex justify-between items-center border-b pb-2">
                <div className="text-sm">
                  <p className="font-medium">{addr.street}</p>
                  <p className="text-gray-500 text-xs">{addr.city}, {addr.zip}</p>
                </div>
                <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-500 text-xs">Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📦 Orders Section */}
      <h2 className="text-xl font-bold mb-3">My Orders 📦</h2>
      {orders.length === 0 && <p className="text-center py-10 text-gray-500">No orders found ❌</p>}

      {orders.map(o => {
        const total = Number(o.total) || (Number(o.itemsTotal || 0) + Number(o.shipping || 0));
        const current = steps.indexOf(o.status || "Pending");
        const progress = current <= 0 ? 5 : (current / (steps.length - 1)) * 100;
        const d = getDates(o);

        return (
          <div key={o.id} className="bg-white p-4 rounded-2xl mb-4 shadow">
            {o.items?.[0] && (
              <div className="flex gap-3 mb-3">
                <img src={o.items[0]?.image} className="w-16 h-16 rounded-lg border object-cover" alt="product" />
                <div>
                  <p className="font-semibold text-sm line-clamp-1">{o.items[0]?.name}</p>
                  <p className="text-gray-500 text-xs">Qty: {o.items[0]?.qty}</p>
                </div>
              </div>
            )}
            <p className="text-green-600 font-bold">₹{total}</p>
            <p className="text-yellow-600 font-semibold text-sm">{o.status}</p>
            <p className="text-[10px] mt-1 text-gray-400">🚚 Expected Delivery: {getDeliveryDate(o)}</p>

            <div className="mt-3">
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-green-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="flex justify-between text-[8px] mt-2 text-gray-400">
              {steps.map((s, i) => (
                <span key={i} className={i <= current ? "text-green-600 font-bold" : ""}>{s}</span>
              ))}
            </div>

            <div className="mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <p className="text-green-600 font-semibold text-xs">{getTrackingText(o.status)}</p>
              <div className="mt-3 text-[10px] space-y-1">
                <div className="flex justify-between"><span>Ordered</span><span>{d.ordered}</span></div>
                <div className="flex justify-between"><span>Shipped</span><span>{d.shipped}</span></div>
                <div className="flex justify-between"><span>Out for Delivery</span><span>{d.out}</span></div>
                <div className="flex justify-between font-bold text-green-600"><span>Expected Delivery</span><span>{d.delivered}</span></div>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button onClick={() => router.push(`/track/${o.id}`)} className="text-blue-600 text-sm font-medium">View Tracking</button>
              <button onClick={() => { setSelectedOrder(o); setShowHelp(true); }} className="border px-4 py-1 rounded-full text-xs font-medium">Need Help?</button>
            </div>
          </div>
        );
      })}

      {/* Help Modal */}
      {showHelp && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
            <h3 className="font-bold mb-4">Support for Order #{selectedOrder.id.slice(-5)}</h3>
            <button onClick={async () => {
              if(!confirm("Are you sure?")) return;
              await updateDoc(doc(db, "orders", selectedOrder.id), { status: "Cancelled" });
              alert("Order Cancelled ✅");
              setShowHelp(false);
            }} className="w-full bg-red-500 text-white p-3 rounded-xl mb-3 font-bold">Cancel Order</button>

            <select className="w-full border p-3 mb-3 rounded-xl text-sm" value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="">Select Return Reason</option>
              <option>Wrong Product Sent</option>
              <option>Product is Damaged</option>
              <option>Changed my mind</option>
            </select>

            <button onClick={async () => {
              if (!reason) return alert("Please select a reason");
              await addDoc(collection(db, "returns"), {
                orderId: selectedOrder.id,
                userId: selectedOrder.userId,
                reason,
                status: "Requested",
                createdAt: new Date()
              });
              alert("Return Request Sent ✅");
              setShowHelp(false);
            }} className="w-full bg-black text-white p-3 rounded-xl font-bold">Request Return</button>
            <button onClick={() => setShowHelp(false)} className="w-full mt-4 text-gray-400 text-sm">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

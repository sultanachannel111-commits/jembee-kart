"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  orderBy
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

export default function AdminOrdersPage() {

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");

  /* ========================
     REALTIME FETCH
  ========================= */
  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setOrders(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  /* ========================
     SEND TO QIKINK
  ========================= */
  const sendToQikink = async (orderId: string) => {
    try {
      const res = await fetch("/api/qikink/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });

      const data = await res.json();

      if (data.success) {
        await updateDoc(doc(db, "orders", orderId), {
          orderStatus: "Processing",
          updatedAt: new Date()
        });
        toast.success("Sent to Qikink 🚀");
      } else {
        toast.error("Failed to send order");
      }
    } catch {
      toast.error("Server error");
    }
  };

  /* ========================
     STATUS UPDATE FUNCTION
  ========================= */
  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        orderStatus: newStatus,
        updatedAt: new Date()
      });
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  /* ========================
     FILTER LOGIC
  ========================= */
  let filteredOrders = orders;

  if (tab !== "All") {
    filteredOrders = filteredOrders.filter(o => o.orderStatus === tab);
  }

  filteredOrders = filteredOrders.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.address?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-purple-600">
        Loading Jembee Orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-20">
      <div className="max-w-5xl mx-auto">
        
        <h1 className="text-3xl font-black text-slate-900 mb-6 italic tracking-tighter">
          ORDER MANAGEMENT
        </h1>

        {/* SEARCH BAR */}
        <input
          type="text"
          placeholder="Search by Order ID or Name..."
          className="border-2 border-slate-200 p-4 rounded-2xl w-full mb-6 focus:border-purple-500 outline-none transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* TABS */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {["All", "PLACED", "Processing", "Shipped", "Delivered"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
                tab === t ? "bg-purple-600 text-white shadow-lg shadow-purple-200" : "bg-white text-slate-400 border border-slate-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ORDERS LIST */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-bold">No orders found.</div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md transition-all">
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-sm font-black text-slate-900">#{order.id.slice(-6)}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : "Recently"}
                    </p>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${
                    order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {order.orderStatus || "PLACED"}
                  </span>
                </div>

                {/* ITEMS SECTION */}
                <div className="bg-slate-50 p-4 rounded-2xl mb-4">
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm mb-1">
                      <span className="font-bold text-slate-700">{item.name} <span className="text-slate-400 italic">x{item.qty}</span></span>
                      <span className="font-black text-slate-900">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between font-black text-purple-600">
                    <span>TOTAL</span>
                    <span>₹{order.total}</span>
                  </div>
                </div>

                {/* CUSTOMER INFO */}
                <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Customer</p>
                    <p className="font-bold text-slate-800">{order.address?.name}</p>
                    <p className="text-slate-500">{order.address?.phone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Shipping Address</p>
                    <p className="text-slate-500 leading-tight">{order.address?.address}, {order.address?.city} - {order.address?.pincode}</p>
                  </div>
                </div>

                {/* ACTION BUTTONS (Sahi kiya hua section) */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
                  <button
                    onClick={() => sendToQikink(order.id)}
                    className="bg-purple-600 text-white px-5 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-purple-700 active:scale-95 transition-all"
                  >
                    Send to Qikink
                  </button>
                  <button
                    onClick={() => updateStatus(order.id, "Shipped")}
                    className="bg-blue-500 text-white px-5 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-blue-600 active:scale-95 transition-all"
                  >
                    Mark Shipped
                  </button>
                  <button
                    onClick={() => updateStatus(order.id, "Delivered")}
                    className="bg-green-600 text-white px-5 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-green-700 active:scale-95 transition-all"
                  >
                    Mark Delivered
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

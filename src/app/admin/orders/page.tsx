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
import { 
  Package, Search, Clock, CheckCircle2, 
  Truck, Phone, MapPin, Trash2, ChevronRight
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");

  // 1. Real-time Fetch
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
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

  // 2. Qikink Integration
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
        toast.error(data.message || "Failed to send");
      }
    } catch {
      toast.error("Network error");
    }
  };

  // 3. Simple Status Update
  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        orderStatus: newStatus,
        updatedAt: new Date()
      });
      toast.success(`Status: ${newStatus}`);
    } catch {
      toast.error("Update failed");
    }
  };

  // 4. Filtering Logic (Search by ID, Name, or Phone)
  const filteredOrders = orders.filter(o => {
    const matchesTab = tab === "All" || o.orderStatus === tab;
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      o.id.toLowerCase().includes(searchLower) || 
      o.address?.name?.toLowerCase().includes(searchLower) ||
      o.address?.phone?.includes(searchLower);
    
    return matchesTab && matchesSearch;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 pb-24">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Jembee Admin</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[4px]">Orders & Logistics</p>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col gap-4 mb-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text"
              placeholder="Search ID, Name or Phone..."
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none font-bold text-xs focus:ring-2 ring-slate-100 transition-all"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {["All", "PLACED", "Processing", "Shipped", "Delivered", "CANCELLED"].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-2 rounded-full font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${
                  tab === t ? "bg-black text-white shadow-lg" : "bg-white text-slate-400 border border-slate-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-6">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-[35px] border border-slate-100 shadow-sm overflow-hidden">
              
              {/* Card Header */}
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-xs italic">#</div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-tight">Order {order.id.slice(-8)}</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{order.orderStatus || "PLACED"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={() => updateStatus(order.id, "CANCELLED")}
                     className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 grid md:grid-cols-2 gap-8">
                {/* Items */}
                <div className="space-y-4">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Customer Cart</p>
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-600">{item.name} x{item.qty}</span>
                        <span className="text-slate-900">₹{item.price * item.qty}</span>
                      </div>
                    ))}
                    <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between text-xs font-black">
                      <span>TOTAL</span>
                      <span className="text-black">₹{order.total}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping & Quick Actions */}
                <div className="space-y-6">
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Shipping To</p>
                    <p className="text-[11px] font-bold text-slate-800 uppercase italic">{order.address?.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight mt-1">
                      {order.address?.street}, {order.address?.city} - {order.address?.pincode}
                    </p>
                    <a href={`tel:${order.address?.phone}`} className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 mt-2 uppercase tracking-tighter">
                      <Phone size={10} /> {order.address?.phone}
                    </a>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => sendToQikink(order.id)}
                      disabled={order.orderStatus === "Processing"}
                      className="w-full bg-black text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all disabled:opacity-20"
                    >
                      {order.orderStatus === "Processing" ? "In Qikink" : "Push to Qikink"}
                    </button>
                    
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(order.id, "Shipped")} className="flex-1 bg-indigo-50 text-indigo-600 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest border border-indigo-100">Shipped</button>
                      <button onClick={() => updateStatus(order.id, "Delivered")} className="flex-1 bg-green-50 text-green-600 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest border border-green-100">Delivered</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tracking Input */}
              {(order.orderStatus === "Shipped" || order.orderStatus === "Processing") && (
                <div className="px-6 pb-6 pt-2">
                  <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                    <Truck size={16} className="text-slate-400" />
                    <input 
                      type="text"
                      defaultValue={order.tracking_number || ""}
                      placeholder="Enter AWB Number..."
                      className="bg-transparent border-none outline-none flex-1 text-[11px] font-bold text-slate-700"
                      onBlur={(e) => {
                        if(e.target.value && e.target.value !== order.tracking_number) {
                          updateDoc(doc(db, "orders", order.id), {
                            tracking_number: e.target.value,
                            tracking_url: `https://qikink.shiprocket.co/tracking/${e.target.value}`
                          });
                          toast.success("Tracking Updated!");
                        }
                      }}
                    />
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      </div>
      <p className="mt-20 text-center text-[8px] font-black text-slate-200 uppercase tracking-[10px]">Jembee Admin Panel</p>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function SellerEarnings() {
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    available: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadEarnings(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const loadEarnings = async (uid: string) => {
    try {
      const q = query(collection(db, "orders"), where("sellerRef", "==", uid));
      const snap = await getDocs(q);

      let totalRevenue = 0;
      let availableAmount = 0;
      let pendingAmount = 0;

      snap.forEach((doc) => {
        const data: any = doc.data();
        
        // Calculation Logic: Profit ka 50%
        const salePrice = Number(data.total) || 0;
        const basePrice = Number(data.basePrice) || 0;
        
        let commission = 0;
        
        // Agar database mein already commission calculated hai to wo lo
        if (data.commission !== undefined) {
          commission = Number(data.commission);
        } else {
          // Nayi Calculation: (Sale - Base) / 2
          const profit = salePrice - basePrice;
          commission = profit > 0 ? profit * 0.50 : 0;
        }

        const status = (data.orderStatus || data.status || "PENDING").toUpperCase();

        totalRevenue += salePrice;

        if (status === "DELIVERED") {
          availableAmount += commission;
        } else if (["PLACED", "PROCESSING", "SHIPPED", "PENDING"].includes(status)) {
          pendingAmount += commission;
        }
      });

      setStats({
        orders: snap.size,
        revenue: totalRevenue,
        available: availableAmount,
        pending: pendingAmount,
      });
    } catch (err) {
      console.error("Error loading earnings:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-6 text-white pb-24">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">
            Seller <span className="text-blue-500">Profits</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
            50% Profit Share Model Active 🚀
          </p>
        </div>

        {/* REVENUE CARD */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-8 mb-8 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-100 text-sm font-medium mb-1">Total Order Value</p>
            <h2 className="text-5xl font-black tracking-tight">₹{stats.revenue.toLocaleString()}</h2>
            <div className="mt-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider">{stats.orders} Total Sales</span>
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50"></div>
        </div>

        {/* EARNINGS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* AVAILABLE */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-[28px] hover:border-green-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-green-500/20 p-3 rounded-2xl text-green-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-lg uppercase">Earned</span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Available Commission</p>
            <h3 className="text-3xl font-black mt-1 text-green-400">₹{stats.available.toLocaleString()}</h3>
          </div>

          {/* PENDING */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-[28px] hover:border-yellow-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-yellow-500/20 p-3 rounded-2xl text-yellow-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-[10px] font-black text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-lg uppercase">Processing</span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Pending Share</p>
            <h3 className="text-3xl font-black mt-1 text-yellow-400">₹{stats.pending.toLocaleString()}</h3>
          </div>

        </div>

        {/* CALCULATION INFO */}
        <div className="mt-8 p-5 bg-blue-500/5 rounded-3xl border border-blue-500/10">
          <h4 className="text-blue-400 text-xs font-black uppercase mb-2">How it works?</h4>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Aapka commission har product ke <span className="text-white font-bold">Profit (Sale Price - Base Price)</span> ka <span className="text-white font-bold">50%</span> hota hai. 
            Amount tabhi "Available" hota hai jab order status <span className="text-green-500 font-bold uppercase text-[10px]">Delivered</span> ho jaye.
          </p>
        </div>

      </div>
    </div>
  );
}

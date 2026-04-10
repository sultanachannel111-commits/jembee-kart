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
        const total = Number(data.total) || 0;
        const commission = Number(data.commission) || 0;
        const status = (data.orderStatus || data.status || "PENDING").toUpperCase();

        totalRevenue += total;

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
        
        {/* HEADER SECTION */}
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">
            Dashboard <span className="text-blue-500">Analytics</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Real-time Affiliate Tracking
          </p>
        </div>

        {/* MAIN BALANCE CARD */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-8 mb-8 shadow-2xl shadow-blue-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-100 text-sm font-medium mb-1">Total Sales Revenue</p>
            <h2 className="text-5xl font-black tracking-tight">₹{stats.revenue.toLocaleString()}</h2>
            <div className="mt-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider">{stats.orders} Total Orders</span>
            </div>
          </div>
          {/* Decorative Circle */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* EARNINGS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* AVAILABLE CARD */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-[28px] hover:border-green-500/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-green-500/20 p-3 rounded-2xl text-green-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-lg uppercase">Withdrawable</span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Available Balance</p>
            <h3 className="text-3xl font-black mt-1 text-green-400">₹{stats.available.toLocaleString()}</h3>
          </div>

          {/* PENDING CARD */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-[28px] hover:border-yellow-500/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-yellow-500/20 p-3 rounded-2xl text-yellow-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-[10px] font-black text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-lg uppercase">In Verification</span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Pending Earnings</p>
            <h3 className="text-3xl font-black mt-1 text-yellow-400">₹{stats.pending.toLocaleString()}</h3>
          </div>

        </div>

        {/* INFO FOOTER */}
        <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">
            Note: Earnings become "Available" once the order status is marked as <span className="text-green-500">Delivered</span>.
          </p>
        </div>

      </div>
    </div>
  );
}

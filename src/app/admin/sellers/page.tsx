"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  writeBatch
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SellersPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [kycData, setKycData] = useState<any>({}); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      // 1. FETCH SELLERS
      const userSnap = await getDocs(collection(db, "users"));
      const sellerList = userSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((u: any) => u.role === "seller");
      setSellers(sellerList);

      // 2. FETCH ALL ORDERS
      const orderSnap = await getDocs(collection(db, "orders"));
      setOrders(orderSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // 3. FETCH ALL KYC RECORDS
      const kycSnap = await getDocs(collection(db, "sellerKYC"));
      const kycMap: any = {};
      kycSnap.docs.forEach(d => { kycMap[d.id] = d.data(); });
      setKycData(kycMap);

    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  }

  async function toggleSeller(id: string, active: boolean) {
    setLoading(true);
    await updateDoc(doc(db, "users", id), { active: !active });
    await loadAll();
    setLoading(false);
  }

  // ================= CALCULATE DATA (Full Logic) =================
  const sellerStats: any = {};
  orders.forEach((o: any) => {
    const sId = o.sellerRef;
    if (!sId) return;

    const status = (o.orderStatus || o.status || "").toUpperCase();
    if (["RETURNED", "CANCELLED", "REFUNDED"].includes(status)) return;

    const isOnlinePaid = o.paymentMethod !== "COD" && o.paymentStatus?.toLowerCase() === "paid";
    const isCODDelivered = o.paymentMethod === "COD" && status === "DELIVERED";

    if (!isOnlinePaid && !isCODDelivered) return;

    if (!sellerStats[sId]) {
      sellerStats[sId] = {
        orders: 0,
        unpaidCommission: 0,
        totalEarned: 0,
        orderIds: [] 
      };
    }

    let orderComm = Number(o.commission) || ((Number(o.total) - Number(o.basePrice)) * 0.5) || 0;

    if (o.payoutStatus !== "PAID_TO_SELLER") {
      sellerStats[sId].unpaidCommission += orderComm;
      sellerStats[sId].orderIds.push(o.id);
    }
    
    sellerStats[sId].totalEarned += orderComm;
    sellerStats[sId].orders += 1;
  });

  // ================= PAYOUT FUNCTION =================
  async function markPaid(sellerId: string, amount: number, orderIds: string[]) {
    const kyc = kycData[sellerId];
    if (!kyc) return alert("KYC details missing for this seller!");

    const confirmMsg = `Confirm Payment of ₹${amount.toFixed(2)}?\n\nBank: ${kyc.bankName}\nAcc: ${kyc.accountNumber}\nIFSC: ${kyc.ifsc}\nHolder: ${kyc.accountHolder}`;
    
    if (!confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const batch = writeBatch(db);
      const payoutRef = doc(collection(db, "payouts"));
      batch.set(payoutRef, {
        sellerId,
        amount,
        paidAt: new Date(),
        status: "SUCCESS"
      });

      orderIds.forEach(orderId => {
        batch.update(doc(db, "orders", orderId), { payoutStatus: "PAID_TO_SELLER" });
      });

      await batch.commit();
      alert("✅ Payout Successful!");
      await loadAll();
    } catch (err) {
      alert("Error processing payout");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-6 text-white font-sans">
      {/* HEADER - Wapas laya gaya */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Seller Management 💼</h1>
          <p className="opacity-60 text-sm mt-1">Review earnings and settle payouts for JembeeKart sellers.</p>
        </div>
        <button onClick={loadAll} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-all">
          {loading ? "Syncing..." : "REFRESH DATA"}
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellers.map((s) => {
          const stats = sellerStats[s.id] || { orders: 0, unpaidCommission: 0, totalEarned: 0, orderIds: [] };
          const kyc = kycData[s.id];

          return (
            <div key={s.id} className="backdrop-blur-3xl bg-white/10 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase text-indigo-300 tracking-widest mb-1">Affiliate Seller</p>
                    <p className="text-xl font-bold">{s.name || "Seller Name"}</p>
                    <p className="text-xs opacity-50">{s.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${s.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {s.active ? "Verified" : "Blocked"}
                  </span>
                </div>

                {/* KYC Details Section */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-tighter">Bank Info {kyc ? "✅" : "❌"}</p>
                  {kyc ? (
                    <div className="text-[11px] opacity-80 leading-tight">
                      <p>🏦 {kyc.bankName}</p>
                      <p>💳 {kyc.accountNumber}</p>
                      <p>👤 {kyc.accountHolder}</p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-red-400">KYC details not submitted</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] opacity-50 font-bold uppercase">Total Earned</p>
                      <p className="text-lg font-black">₹{stats.totalEarned.toFixed(2)}</p>
                   </div>
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] opacity-50 font-bold uppercase">Orders</p>
                      <p className="text-lg font-black">{stats.orders}</p>
                   </div>
                </div>

                <div className="bg-indigo-500/20 p-5 rounded-3xl border border-indigo-500/30">
                   <p className="text-xs font-bold text-indigo-200 mb-1">Current Pending Balance</p>
                   <p className="text-3xl font-black text-white">₹{stats.unpaidCommission.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <button
                  disabled={loading || stats.unpaidCommission <= 0 || !kyc}
                  onClick={() => markPaid(s.id, stats.unpaidCommission, stats.orderIds)}
                  className="w-full py-4 rounded-2xl bg-white text-indigo-900 font-black text-xs uppercase tracking-widest shadow-lg hover:bg-indigo-50 transition-all disabled:opacity-30"
                >
                  Pay Balance Now
                </button>

                <button
                  onClick={() => toggleSeller(s.id, s.active)}
                  className={`w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-widest border transition-all ${
                    s.active ? "border-red-500/50 text-red-400 hover:bg-red-500/10" : "border-green-500/50 text-green-400 hover:bg-green-500/10"
                  }`}
                >
                  {s.active ? "Restrict Seller" : "Unrestrict Seller"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

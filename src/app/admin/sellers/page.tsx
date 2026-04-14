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
  const [selectedSeller, setSelectedSeller] = useState<any>(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const userSnap = await getDocs(collection(db, "users"));
      const sellerList = userSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((u: any) => u.role === "seller");
      setSellers(sellerList);

      const orderSnap = await getDocs(collection(db, "orders"));
      setOrders(orderSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const kycSnap = await getDocs(collection(db, "sellerKYC"));
      const kycMap: any = {};
      kycSnap.docs.forEach(d => { kycMap[d.id] = d.data(); });
      setKycData(kycMap);
    } catch (error) { console.error("Error loading:", error); }
    setLoading(false);
  }

  async function toggleSeller(id: string, active: boolean) {
    setLoading(true);
    await updateDoc(doc(db, "users", id), { active: !active });
    // Update local state for modal immediately
    if (selectedSeller && selectedSeller.id === id) {
      setSelectedSeller({...selectedSeller, active: !active});
    }
    await loadAll();
    setLoading(false);
  }

  // ================= CALCULATE STATS =================
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
      sellerStats[sId] = { orders: 0, unpaidCommission: 0, totalEarned: 0, orderIds: [] };
    }

    let orderComm = Number(o.commission) || ((Number(o.total) - Number(o.basePrice)) * 0.5) || 0;
    if (o.payoutStatus !== "PAID_TO_SELLER") {
      sellerStats[sId].unpaidCommission += orderComm;
      sellerStats[sId].orderIds.push(o.id);
    }
    sellerStats[sId].totalEarned += orderComm;
    sellerStats[sId].orders += 1;
  });

  // SORT: Pending balance upar
  const sortedSellers = [...sellers].sort((a, b) => {
    const pendingA = sellerStats[a.id]?.unpaidCommission || 0;
    const pendingB = sellerStats[b.id]?.unpaidCommission || 0;
    return pendingB - pendingA;
  });

  async function markPaid(sellerId: string, amount: number, orderIds: string[]) {
    const kyc = kycData[sellerId];
    if (!kyc) return alert("KYC Details Missing!");
    if (!confirm(`Confirm Payment of ₹${amount.toFixed(2)} to ${kyc.accountHolder}?`)) return;

    setLoading(true);
    try {
      const batch = writeBatch(db);
      batch.set(doc(collection(db, "payouts")), { sellerId, amount, paidAt: new Date(), status: "SUCCESS" });
      orderIds.forEach(id => batch.update(doc(db, "orders", id), { payoutStatus: "PAID_TO_SELLER" }));
      await batch.commit();
      alert("✅ Paid Successfully!");
      setSelectedSeller(null);
      await loadAll();
    } catch (err) { alert("Error!"); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Seller Management 💼</h1>
            <p className="opacity-60 text-sm mt-1">Review and settle payouts for JembeeKart.</p>
          </div>
          <button onClick={loadAll} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-all">
            {loading ? "Syncing..." : "REFRESH DATA"}
          </button>
        </div>

        {/* LIST VIEW */}
        <div className="space-y-3">
          {sortedSellers.map((s, index) => {
            const stats = sellerStats[s.id] || { unpaidCommission: 0 };
            const isPending = stats.unpaidCommission > 0;
            return (
              <div key={s.id} className="backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center hover:bg-white/10 transition-all">
                <div className="flex items-center gap-5">
                  <span className="text-sm opacity-20 font-black">#{index + 1}</span>
                  <div>
                    <p className="font-bold text-lg leading-tight">{s.name || "Seller"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2 h-2 rounded-full ${isPending ? "bg-orange-500 animate-pulse" : "bg-green-500"}`}></span>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${isPending ? "text-orange-400" : "text-green-400"}`}>
                        {isPending ? `Pending: ₹${stats.unpaidCommission.toFixed(2)}` : "All Settled"}
                      </p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSeller(s)}
                  className="bg-white text-slate-900 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  Details
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* FULL MODAL CARD (Screenshots wala Design) */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-50">
          <div className="relative w-full max-w-md bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-[3rem] p-8 border border-white/20 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in duration-300">
            <button onClick={() => setSelectedSeller(null)} className="absolute top-8 right-8 bg-white/10 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all">✕</button>
            
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black uppercase text-indigo-300 tracking-[0.2em] mb-1">Verified Seller</p>
                  <h2 className="text-3xl font-black leading-none">{selectedSeller.name}</h2>
                  <p className="text-xs opacity-50 mt-1">{selectedSeller.email}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedSeller.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {selectedSeller.active ? "Active" : "Blocked"}
                </span>
              </div>

              {/* Bank Details Box */}
              <div className="bg-white/5 p-5 rounded-3xl border border-white/10 space-y-2">
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Bank Payout Info</p>
                {kycData[selectedSeller.id] ? (
                  <div className="text-xs space-y-1.5 opacity-90 font-medium">
                    <p className="flex justify-between"><span>Bank:</span> <span className="font-bold">{kycData[selectedSeller.id].bankName}</span></p>
                    <p className="flex justify-between"><span>A/C No:</span> <span className="font-bold">{kycData[selectedSeller.id].accountNumber}</span></p>
                    <p className="flex justify-between"><span>IFSC:</span> <span className="font-bold">{kycData[selectedSeller.id].ifsc}</span></p>
                    <p className="flex justify-between"><span>Holder:</span> <span className="font-bold">{kycData[selectedSeller.id].accountHolder}</span></p>
                  </div>
                ) : <p className="text-xs text-red-400 font-bold animate-pulse">⚠️ KYC Pending - Cannot Pay</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5">
                  <p className="text-[10px] opacity-50 font-bold uppercase tracking-widest">Total Earned</p>
                  <p className="text-xl font-black">₹{sellerStats[selectedSeller.id]?.totalEarned.toFixed(2) || "0.00"}</p>
                </div>
                <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5">
                  <p className="text-[10px] opacity-50 font-bold uppercase tracking-widest">Orders</p>
                  <p className="text-xl font-black">{sellerStats[selectedSeller.id]?.orders || 0}</p>
                </div>
              </div>

              <div className="bg-indigo-500/30 p-6 rounded-[2.5rem] border border-indigo-400/30 shadow-inner">
                <p className="text-xs font-bold text-indigo-200 mb-1">Current Pending Balance</p>
                <p className="text-4xl font-black text-white">₹{sellerStats[selectedSeller.id]?.unpaidCommission.toFixed(2) || "0.00"}</p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  disabled={loading || (sellerStats[selectedSeller.id]?.unpaidCommission || 0) <= 0 || !kycData[selectedSeller.id]}
                  onClick={() => markPaid(selectedSeller.id, sellerStats[selectedSeller.id].unpaidCommission, sellerStats[selectedSeller.id].orderIds)}
                  className="w-full py-5 rounded-[1.5rem] bg-white text-indigo-900 font-black text-sm uppercase tracking-widest shadow-[0_10px_20px_rgba(255,255,255,0.1)] hover:bg-indigo-50 transition-all disabled:opacity-20"
                >
                  Pay Balance Now
                </button>

                <button
                  onClick={() => toggleSeller(selectedSeller.id, selectedSeller.active)}
                  className={`w-full py-4 rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.2em] border transition-all ${
                    selectedSeller.active ? "border-red-500/30 text-red-400 hover:bg-red-500/10" : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                  }`}
                >
                  {selectedSeller.active ? "Restrict Seller" : "Unrestrict Seller"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [kycData, setKycData] = useState<any>({}); // Store KYC bank details
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
      console.error("Error:", error);
    }
    setLoading(false);
  }

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

  async function markPaid(sellerId: string, amount: number, orderIds: string[]) {
    const kyc = kycData[sellerId];
    if (!kyc) return alert("Error: Seller Bank Details not found in KYC!");

    const confirmMsg = `
      Paying: ₹${amount.toFixed(2)}
      Bank: ${kyc.bankName}
      Acc: ${kyc.accountNumber}
      IFSC: ${kyc.ifsc}
      Holder: ${kyc.accountHolder}
      
      Confirm payment done?
    `;

    if (!confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const batch = writeBatch(db);
      const payoutRef = doc(collection(db, "payouts"));
      batch.set(payoutRef, { sellerId, amount, paidAt: new Date(), status: "SUCCESS" });

      orderIds.forEach(id => {
        batch.update(doc(db, "orders", id), { payoutStatus: "PAID_TO_SELLER" });
      });

      await batch.commit();
      alert("✅ Balance Cleared!");
      await loadAll();
    } catch (err) { alert("Error!"); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6 text-white">
      <h1 className="text-3xl font-black mb-8 text-center">JembeeKart Seller Payouts 💼</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {sellers.map((s) => {
          const stats = sellerStats[s.id] || { orders: 0, unpaidCommission: 0, totalEarned: 0, orderIds: [] };
          const kyc = kycData[s.id];

          return (
            <div key={s.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
              <div className="flex justify-between">
                <div>
                  <h2 className="text-xl font-bold">{s.name || "Sadiya"}</h2>
                  <p className="text-xs opacity-50">{s.email}</p>
                </div>
                <span className="text-[10px] bg-indigo-500/20 p-1 px-3 rounded-full text-indigo-300">
                  {kyc ? "KYC Verified" : "KYC Missing"}
                </span>
              </div>

              {kyc && (
                <div className="bg-white/5 p-3 rounded-xl text-[10px] grid grid-cols-2 gap-2 opacity-80">
                   <p>🏦 {kyc.bankName}</p>
                   <p>👤 {kyc.accountHolder}</p>
                   <p>💳 {kyc.accountNumber}</p>
                   <p>🔑 {kyc.ifsc}</p>
                </div>
              )}

              <div className="bg-indigo-600/20 p-4 rounded-2xl border border-indigo-500/30">
                <p className="text-xs opacity-60">Pending Payout</p>
                <p className="text-3xl font-black">₹{stats.unpaidCommission.toFixed(2)}</p>
              </div>

              <button
                disabled={loading || stats.unpaidCommission <= 0}
                onClick={() => markPaid(s.id, stats.unpaidCommission, stats.orderIds)}
                className="w-full py-3 bg-white text-indigo-900 rounded-xl font-black uppercase text-xs"
              >
                Clear Balance & Pay
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";

export default function WithdrawPage() {
  const [user, setUser] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [upi, setUpi] = useState("");
  const [balance, setBalance] = useState(0);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔐 AUTH CHECK
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // 🔥 FETCH ACCURATE BALANCE (Qikink Profit Logic)
  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Sirf wahi orders jinka payment customer ne kar diya hai aur seller ko payout nahi mila
      const q = query(
        collection(db, "orders"),
        where("sellerRef", "==", user.uid),
        where("paymentStatus", "==", "paid")
      );

      const snap = await getDocs(q);
      let totalUnpaid = 0;

      snap.forEach(doc => {
        const data = doc.data();
        // Check if this specific order is already settled by admin
        if (data.payoutStatus !== "PAID_TO_SELLER") {
          totalUnpaid += data.commission || 0;
        }
      });

      setBalance(totalUnpaid);

      // 2. Fetch Withdraw History (Newest first)
      const rq = query(
        collection(db, "withdrawRequests"),
        where("sellerId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const rsnap = await getDocs(rq);
      const rdata = rsnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(rdata);

    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // 💸 SUBMIT REQUEST
  const handleWithdraw = async () => {
    if (!amount || !upi) return toast.error("Please fill all details");
    if (Number(amount) < 100) return toast.error("Minimum withdraw ₹100");
    if (Number(amount) > balance) return toast.error("Insufficient balance");

    setLoading(true);
    try {
      await addDoc(collection(db, "withdrawRequests"), {
        sellerId: user.uid,
        sellerName: user.displayName || "Seller",
        amount: Number(amount),
        upi: upi,
        status: "pending", // admin isse "approved" karega
        createdAt: serverTimestamp()
      });

      toast.success("Request submitted! Admin will verify soon.");
      setAmount("");
      setUpi("");
      fetchData(); // Refresh history
    } catch (e) {
      toast.error("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900">Earnings 💰</h1>
          <p className="text-sm text-slate-500 font-medium">Withdraw your Qikink design profits.</p>
        </div>

        {/* 💰 BALANCE CARD */}
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-200 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Withdrawable Balance</p>
            <p className="text-4xl font-black italic">₹{balance}</p>
          </div>
          {/* Background Decoration */}
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        </div>

        {/* 📝 REQUEST FORM */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Request Payout</p>
          
          <div className="space-y-3">
            <input
              type="number"
              placeholder="Enter Amount (Min ₹100)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Enter UPI ID (e.g. name@upi)"
              value={upi}
              onChange={(e) => setUpi(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
            />
            <button
              disabled={loading || balance < 100}
              onClick={handleWithdraw}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-30"
            >
              {loading ? "Processing..." : "Submit Request"}
            </button>
          </div>
        </div>

        {/* 📜 HISTORY SECTION */}
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest ml-2">Recent Payouts</h2>
          
          <div className="space-y-3">
            {requests.length === 0 && (
              <p className="text-center text-slate-400 py-10 text-xs font-bold uppercase italic">No history yet</p>
            )}
            
            {requests.map((r) => (
              <div key={r.id} className="bg-white p-5 rounded-[1.8rem] shadow-sm border border-slate-50 flex justify-between items-center">
                <div>
                  <p className="text-sm font-black text-slate-800">₹{r.amount}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{r.upi}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                  r.status === "approved" ? "bg-green-100 text-green-600" : 
                  r.status === "rejected" ? "bg-red-100 text-red-600" : 
                  "bg-yellow-100 text-yellow-600"
                }`}>
                  {r.status}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

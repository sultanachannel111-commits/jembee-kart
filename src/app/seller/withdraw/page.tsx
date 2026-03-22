"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function WithdrawPage() {

  const [user, setUser] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [upi, setUpi] = useState("");
  const [balance, setBalance] = useState(0);
  const [requests, setRequests] = useState<any[]>([]);

  // 🔐 AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // 🔥 FETCH EARNING
  useEffect(() => {

    if (!user) return;

    const fetchData = async () => {

      const q = query(
        collection(db, "orders"),
        where("sellerId", "==", user.uid)
      );

      const snap = await getDocs(q);

      let total = 0;

      snap.forEach(doc => {
        total += doc.data().commission || 0;
      });

      setBalance(total);

      // 📜 withdraw history
      const rq = query(
        collection(db, "withdrawRequests"),
        where("sellerId", "==", user.uid)
      );

      const rsnap = await getDocs(rq);

      let rdata: any[] = [];

      rsnap.forEach(doc => {
        rdata.push({ id: doc.id, ...doc.data() });
      });

      setRequests(rdata);

    };

    fetchData();

  }, [user]);

  // 💸 SUBMIT REQUEST
  const handleWithdraw = async () => {

    if (!amount || !upi) {
      alert("Fill all fields ❌");
      return;
    }

    if (Number(amount) > balance) {
      alert("Insufficient balance ❌");
      return;
    }

    await addDoc(collection(db, "withdrawRequests"), {
      sellerId: user.uid,
      amount: Number(amount),
      upi,
      status: "pending",
      createdAt: serverTimestamp()
    });

    alert("Withdraw request submitted ✅");

    setAmount("");
    setUpi("");
  };

  return (
    <div className="p-4 space-y-4">

      <h1 className="text-2xl font-bold">
        Withdraw Earnings 💸
      </h1>

      {/* 💰 BALANCE */}
      <div className="bg-white p-4 rounded-xl shadow">
        <p className="text-gray-500 text-sm">Available Balance</p>
        <p className="text-2xl font-bold text-green-600">
          ₹{balance}
        </p>
      </div>

      {/* 📝 FORM */}
      <div className="bg-white p-4 rounded-xl shadow space-y-3">

        <input
          placeholder="Enter amount"
          value={amount}
          onChange={(e)=>setAmount(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />

        <input
          placeholder="Enter UPI ID"
          value={upi}
          onChange={(e)=>setUpi(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />

        <button
          onClick={handleWithdraw}
          className="w-full bg-green-600 text-white py-2 rounded-lg"
        >
          Request Withdraw
        </button>

      </div>

      {/* 📜 HISTORY */}
      <div className="bg-white p-4 rounded-xl shadow">

        <h2 className="font-semibold mb-3">
          Withdraw History
        </h2>

        <div className="space-y-2">

          {requests.map((r)=>(
            <div
              key={r.id}
              className="flex justify-between text-sm border-b pb-2"
            >
              <span>₹{r.amount}</span>
              <span className={`${
                r.status === "approved"
                  ? "text-green-600"
                  : r.status === "rejected"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}>
                {r.status}
              </span>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

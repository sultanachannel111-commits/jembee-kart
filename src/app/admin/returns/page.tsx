"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminReturns() {
  const [returns, setReturns] = useState<any[]>([]);

  useEffect(() => {
    const fetchReturns = async () => {
      const snap = await getDocs(collection(db, "returns"));
      setReturns(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchReturns();
  }, []);

  const approveReturn = async (id: string) => {
    await updateDoc(doc(db, "returns", id), {
      status: "Approved",
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Return Requests</h1>

      {returns.map(r => (
        <div key={r.id} className="bg-white p-4 shadow rounded mb-3">
          <p>Order: {r.orderId}</p>
          <p>Reason: {r.reason}</p>
          <p>Status: {r.status}</p>

          {r.status === "Pending" && (
            <button
              onClick={() => approveReturn(r.id)}
              className="bg-green-500 text-white px-3 py-1 rounded mt-2"
            >
              Approve
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

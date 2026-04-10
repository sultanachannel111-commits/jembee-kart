"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminReturns() {

  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ================= LOAD =================
  const loadReturns = async () => {
    const snap = await getDocs(collection(db, "returns"));

    const list: any[] = [];

    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });

    setReturns(list);
    setLoading(false);
  };

  useEffect(() => {
    loadReturns();
  }, []);

  // ================= APPROVE =================
  const approveReturn = async (r: any) => {

    try {
      // 🔥 update returns
      await updateDoc(doc(db, "returns", r.id), {
        status: "APPROVED"
      });

      // 🔥 update order
      await updateDoc(doc(db, "orders", r.orderId), {
        status: "RETURN_APPROVED"
      });

      alert("Return Approved ✅");

      loadReturns();

    } catch (err) {
      alert("Error approving ❌");
    }
  };

  // ================= REJECT =================
  const rejectReturn = async (r: any) => {

    try {
      await updateDoc(doc(db, "returns", r.id), {
        status: "REJECTED"
      });

      await updateDoc(doc(db, "orders", r.orderId), {
        status: "RETURN_REJECTED"
      });

      alert("Return Rejected ❌");

      loadReturns();

    } catch (err) {
      alert("Error rejecting ❌");
    }
  };

  if (loading) {
    return <p className="p-4">Loading...</p>;
  }

  return (
    <div className="p-4">

      <h1 className="text-2xl font-bold mb-4">
        🔄 Return Requests (Admin)
      </h1>

      {returns.length === 0 ? (
        <p>No return requests</p>
      ) : (
        returns.map((r) => (
          <div
            key={r.id}
            className="bg-white p-4 shadow rounded mb-3"
          >
            <p><b>Order:</b> {r.orderId}</p>
            <p><b>User:</b> {r.userId}</p>
            <p><b>Reason:</b> {r.reason}</p>

            <p>
              <b>Status:</b>{" "}
              <span className="font-bold">{r.status}</span>
            </p>

            {r.status === "PENDING" && (
              <div className="flex gap-2 mt-2">

                <button
                  onClick={() => approveReturn(r)}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>

                <button
                  onClick={() => rejectReturn(r)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>

              </div>
            )}
          </div>
        ))
      )}

    </div>
  );
}

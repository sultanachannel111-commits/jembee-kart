"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";

export default function AdminReturns() {

  const [returns, setReturns] = useState<any[]>([]);

  const loadReturns = async () => {
    const snap = await getDocs(collection(db, "returns"));
    setReturns(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    loadReturns();
  }, []);

  // APPROVE
  const approveReturn = async (r: any) => {
    await updateDoc(doc(db, "returns", r.id), {
      status: "APPROVED"
    });

    await updateDoc(doc(db, "orders", r.orderId), {
      status: "RETURN_APPROVED"
    });

    loadReturns();
  };

  // PICKUP
  const startPickup = async (r: any) => {
    await updateDoc(doc(db, "returns", r.id), {
      status: "PICKUP"
    });

    await updateDoc(doc(db, "orders", r.orderId), {
      status: "RETURN_PICKUP"
    });

    loadReturns();
  };

  // RECEIVED
  const completeReturn = async (r: any) => {
    await updateDoc(doc(db, "returns", r.id), {
      status: "DONE"
    });

    await updateDoc(doc(db, "orders", r.orderId), {
      status: "RETURN_DONE"
    });

    loadReturns();
  };

  // EXCHANGE
  const shipExchange = async (r: any) => {
    await updateDoc(doc(db, "orders", r.orderId), {
      status: "EXCHANGE_SHIPPED"
    });

    loadReturns();
  };

  return (
    <div className="p-4">

      <h1 className="text-xl font-bold mb-4">
        Return / Exchange Panel
      </h1>

      {returns.map(r => (
        <div key={r.id} className="border p-3 mb-3">

          <p>Order: {r.orderId}</p>
          <p>Reason: {r.reason}</p>
          <p>Status: {r.status}</p>

          {r.status === "PENDING" && (
            <button onClick={() => approveReturn(r)}>
              Approve
            </button>
          )}

          {r.status === "APPROVED" && (
            <button onClick={() => startPickup(r)}>
              Pickup 🚚
            </button>
          )}

          {r.status === "PICKUP" && (
            <button onClick={() => completeReturn(r)}>
              Received ✅
            </button>
          )}

          {r.status === "DONE" && (
            <button onClick={() => shipExchange(r)}>
              Send Exchange 🎁
            </button>
          )}

        </div>
      ))}

    </div>
  );
}

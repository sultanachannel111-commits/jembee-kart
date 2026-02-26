"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generateUpiLink } from "@/utils/payment";
import { useParams, useRouter } from "next/navigation";

export default function PaymentPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [txn, setTxn] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      const snap = await getDoc(doc(db, "orders", id as string));

      if (!snap.exists()) {
        alert("Order not found");
        router.push("/");
        return;
      }

      setOrder({ id: snap.id, ...snap.data() });
    };

    fetchOrder();
  }, [id, router]);

  useEffect(() => {
    if (!order?.expiresAt) return;

    const interval = setInterval(async () => {
      const expiryTime =
        new Date(order.expiresAt.seconds * 1000).getTime();

      const diff = expiryTime - new Date().getTime();

      if (diff <= 0) {
        setTimeLeft("Expired");
        setExpired(true);
        clearInterval(interval);

        await updateDoc(doc(db, "orders", order.id), {
          paymentStatus: "EXPIRED",
        });

      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${m}m ${s}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order]);

  if (!order) return <div className="p-6">Loading...</div>;

  const upiLink = generateUpiLink(order.amount, order.orderId);

  const submitPayment = async () => {
    if (!txn) {
      alert("Enter Transaction ID");
      return;
    }

    await updateDoc(doc(db, "orders", order.id), {
      paymentStatus: "UNDER_REVIEW",
      transactionId: txn,
    });

    alert("Payment submitted successfully ✅");
    router.push("/thank-you");
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">

      <h2 className="text-2xl font-bold text-center">
        Complete Payment 💳
      </h2>

      <div className="text-center text-red-600 font-semibold">
        Expires in: {timeLeft}
      </div>

      {!expired && (
        <>
          <a
            href={upiLink}
            className="block bg-green-600 text-white text-center py-3 rounded-xl"
          >
            Pay ₹{order.amount} via UPI
          </a>

          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${upiLink}`}
            className="mx-auto"
          />

          <input
            placeholder="Enter UPI Transaction ID"
            value={txn}
            onChange={(e) => setTxn(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          />

          <button
            onClick={submitPayment}
            className="w-full bg-black text-white py-2 rounded"
          >
            I Have Paid
          </button>
        </>
      )}

      {expired && (
        <div className="text-center text-red-500 font-semibold">
          Payment Link Expired ❌
        </div>
      )}

    </div>
  );
}

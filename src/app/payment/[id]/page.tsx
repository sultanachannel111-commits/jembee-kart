"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";

export default function PaymentPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [txn, setTxn] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [expired, setExpired] = useState(false);
  const [processing, setProcessing] = useState(false);

  /* 🔥 FETCH ORDER */
  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;

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

  /* 🔥 TIMER */
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

  /* 🔥 UPI LINK */
  const upiId = "sultana9212@axl";
  const merchantName = "JembeeKart";

  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    merchantName
  )}&am=${order.amount}&cu=INR&tr=${order.orderId}&tn=${encodeURIComponent(
    "JembeeKart Order"
  )}`;

  const openUpi = () => {
    window.location.href = upiLink;
  };

  /* 🔥 SUBMIT PAYMENT */
  const submitPayment = async () => {
    if (!txn) {
      alert("Enter Transaction ID");
      return;
    }

    if (processing) return;

    setProcessing(true);

    try {
      // 💰 SELLER COMMISSION LOGIC (Added for Dashboard sync)
      const profit = (order.amount || 0) - (order.basePrice || 0);
      const calculatedCommission = profit > 0 ? profit * 0.50 : 0;
      
      // Affiliate ID tracking
      const sellerId = localStorage.getItem("affiliate") || order.sellerRef || "";

      /* 1️⃣ Update Order Status & Seller Data (Dashboard fix) */
      await updateDoc(doc(db, "orders", order.id), {
        paymentStatus: "UNDER_REVIEW",
        transactionId: txn,
        submittedAt: new Date(),
        commission: calculatedCommission,
        sellerRef: sellerId,
      });

      /* 2️⃣ Reduce Product Stock */
      await updateDoc(doc(db, "products", order.productId), {
        stock: increment(-order.quantity),
      });

      /* 3️⃣ Create Admin Notification */
      await addDoc(collection(db, "notifications"), {
        message: `💰 Payment Submitted: ${order.productName} x${order.quantity}`,
        orderId: order.id,
        createdAt: new Date(),
        read: false,
      });

      /* 4️⃣ Trigger Qikink Backend API */
      await fetch("/api/qikink-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
        }),
      });

      alert("Payment submitted successfully ✅");
      router.push("/order-success");

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }

    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white flex items-center justify-center p-6">

      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md space-y-6">

        <h2 className="text-2xl font-bold text-center">
          Complete Payment 💳
        </h2>

        <div className="text-center text-red-600 font-semibold">
          Expires in: {timeLeft}
        </div>

        {!expired && (
          <>
            <button
              onClick={openUpi}
              className="w-full bg-green-600 text-white py-3 rounded-xl text-lg font-semibold"
            >
              Pay ₹{order.amount} via UPI
            </button>

            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                upiLink
              )}`}
              className="mx-auto"
            />

            <input
              placeholder="Enter UPI Transaction ID"
              value={txn}
              onChange={(e) => setTxn(e.target.value)}
              className="w-full border px-4 py-2 rounded-xl"
            />

            <button
              disabled={processing}
              onClick={submitPayment}
              className="w-full bg-black text-white py-3 rounded-xl"
            >
              {processing ? "Processing..." : "I Have Paid"}
            </button>
          </>
        )}

        {expired && (
          <div className="text-center text-red-500 font-semibold">
            Payment Link Expired ❌
          </div>
        )}

      </div>
    </div>
  );
}

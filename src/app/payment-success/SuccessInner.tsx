"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function SuccessPage() {

  const params = useSearchParams();
  const router = useRouter();

  const orderIdFromUrl = params.get("order_id"); // ⚠️ सही param

  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState("Verifying...");
  const [error, setError] = useState("");

  useEffect(() => {

    const verifyAndSave = async () => {

      try {

        if (!orderIdFromUrl) {
          setStatus("Invalid Order ❌");
          return;
        }

        // ✅ VERIFY PAYMENT FROM SERVER
        const verifyRes = await fetch("/api/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ orderId: orderIdFromUrl })
        });

        const verifyData = await verifyRes.json();

        console.log("VERIFY:", verifyData);

        if (!verifyData.success) {
          setStatus("Payment Not Verified ❌");
          setError(JSON.stringify(verifyData));
          return;
        }

        // 🔥 GET SAFE ORDER DATA
        const data = localStorage.getItem("pendingOrder");

        if (!data) {
          setStatus("Order data missing ❌");
          return;
        }

        const orderData = JSON.parse(data);

        // ✅ SAVE ORDER
        const ref = await addDoc(collection(db, "orders"), {
          ...orderData,
          paymentId: orderIdFromUrl,
          status: "Paid",
          createdAt: serverTimestamp()
        });

        setOrderId(ref.id);
        setStatus("Payment Successful ✅");

        // 🔥 CLEAR STORAGE
        localStorage.removeItem("pendingOrder");

      } catch (err: any) {
        console.log("❌ ERROR:", err);
        setStatus("Error ❌");
        setError(err.message);
      }

    };

    verifyAndSave();

  }, [orderIdFromUrl]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-green-100 to-white p-4">

      <div className="bg-white p-6 rounded-2xl shadow text-center max-w-sm w-full">

        <h1 className="text-2xl font-bold text-green-600 mb-3">
          {status}
        </h1>

        {error && (
          <p className="text-red-500 text-xs mb-2">{error}</p>
        )}

        {orderId && (
          <p className="text-sm text-gray-500 mb-4">
            Order ID: {orderId}
          </p>
        )}

        <button
          onClick={() => router.push("/")}
          className="w-full bg-black text-white py-3 rounded-xl mb-2"
        >
          Go to Home
        </button>

        <button
          onClick={() => router.push("/profile")}
          className="w-full border py-3 rounded-xl"
        >
          View Orders
        </button>

      </div>

    </div>
  );
}

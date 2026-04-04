"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function SuccessPage() {

  const params = useSearchParams();
  const router = useRouter();

  const orderIdFromUrl = params.get("orderId");

  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const saveOrder = async () => {

      try {

        // 🔥 GET PENDING ORDER
        const data = localStorage.getItem("pendingOrder");

        if (!data) {
          setLoading(false);
          return;
        }

        const orderData = JSON.parse(data);

        // 🔥 SAVE TO FIRESTORE
        const ref = await addDoc(collection(db, "orders"), {
          ...orderData,
          status: "Paid", // ✅ IMPORTANT
          createdAt: serverTimestamp()
        });

        setOrderId(ref.id);

        // 🔥 CLEAR STORAGE
        localStorage.removeItem("pendingOrder");

      } catch (err) {
        console.log("❌ SAVE ORDER ERROR:", err);
      }

      setLoading(false);
    };

    saveOrder();

  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-green-100 to-white p-4">

      <div className="bg-white p-6 rounded-2xl shadow text-center max-w-sm w-full">

        <h1 className="text-2xl font-bold text-green-600 mb-3">
          Payment Success 🎉
        </h1>

        {loading ? (
          <p className="text-gray-500">Saving your order...</p>
        ) : (
          <>
            <p className="text-gray-600 mb-2">
              Your order has been placed successfully
            </p>

            <p className="text-sm text-gray-500 mb-4">
              Order ID: {orderId || orderIdFromUrl}
            </p>

            <button
              onClick={() => router.push("/")}
              className="w-full bg-black text-white py-3 rounded-xl mb-2"
            >
              Go to Home
            </button>

            <button
              onClick={() => router.push("/my-orders")}
              className="w-full border py-3 rounded-xl"
            >
              View My Orders
            </button>
          </>
        )}

      </div>

    </div>
  );
}

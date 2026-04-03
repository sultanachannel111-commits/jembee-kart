"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function SuccessPage() {

  const params = useSearchParams();
  const router = useRouter();

  const orderId = params.get("orderId"); // ✅ FIXED

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-green-100 to-white p-4">

      <div className="bg-white p-6 rounded-2xl shadow text-center max-w-sm w-full">

        <h1 className="text-2xl font-bold text-green-600 mb-3">
          Payment Success 🎉
        </h1>

        <p className="text-gray-600 mb-2">
          Your order has been placed successfully
        </p>

        <p className="text-sm text-gray-500 mb-4">
          Order ID: {orderId}
        </p>

        {/* 🔥 BUTTONS */}
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

      </div>

    </div>
  );
}

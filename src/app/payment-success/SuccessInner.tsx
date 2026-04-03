"use client";

import { useSearchParams } from "next/navigation";

export default function SuccessPage() {

  const params = useSearchParams();

  const orderId = params.get("order_id");

  return (
    <div className="p-6 text-center">

      <h1 className="text-2xl font-bold text-green-600">
        Payment Success 🎉
      </h1>

      <p>Order ID: {orderId}</p>

    </div>
  );
}

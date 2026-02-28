"use client";

import { useState } from "react";
import { generateUpiLink } from "@/utils/payment";

export default function CheckoutButton({ product }: any) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCheckout = async () => {
    setLoading(true);
    setMessage("");

    try {
      // 1️⃣ Create Order (Pending)
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product,
          quantity: 1,
          paymentMethod: "UPI",
          status: "pending",
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setMessage("❌ Order creation failed");
        setLoading(false);
        return;
      }

      // 2️⃣ Generate UPI Link
      const orderId = data.orderId; // API se orderId return hona chahiye
      const totalAmount = product.sellingPrice;

      const upiLink = generateUpiLink(totalAmount, orderId);

      if (!upiLink) {
        setMessage("❌ Payment link error");
        setLoading(false);
        return;
      }

      // 3️⃣ Open UPI Apps
      window.location.href = upiLink;

    } catch (error: any) {
      setMessage("❌ Server Error: " + error?.message);
    }

    setLoading(false);
  };

  return (
    <div className="mt-6">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg"
      >
        {loading ? "Processing..." : "Pay with UPI"}
      </button>

      {message && (
        <pre className="mt-4 text-sm bg-gray-100 p-3 rounded overflow-auto">
          {message}
        </pre>
      )}
    </div>
  );
}

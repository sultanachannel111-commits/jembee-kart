"use client";

import { useState } from "react";

export default function CheckoutButton({ product }: any) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCheckout = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: {
            id: product.id,
            sellerId: product.sellerId,
            sku: product.sku,
            printTypeId: product.printTypeId,
            costPrice: product.costPrice,
            sellingPrice: product.sellingPrice,
            designLink: product.designLink,
            mockupLink: product.mockupLink,
          },
          customer: {
            firstName: "Ali",
            lastName: "Test",
            address: "Test Street 123",
            phone: "9999999999",
            email: "test@example.com",
            city: "Jamshedpur",
            pincode: "832110",
            state: "Jharkhand",
          },
          quantity: 1,
          paymentMethod: "COD",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("✅ Order Placed Successfully!");
      } else {
        // 🔥 FULL ERROR SHOW
        setMessage("❌ " + JSON.stringify(data, null, 2));
      }

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
        className="w-full bg-black text-white py-3 rounded-lg"
      >
        {loading ? "Processing..." : "Place Order"}
      </button>

      {message && (
        <pre className="mt-4 text-sm bg-gray-100 p-3 rounded overflow-auto">
          {message}
        </pre>
      )}
    </div>
  );
}

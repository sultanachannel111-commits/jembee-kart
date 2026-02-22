"use client";

import { useState } from "react";

export default function TestOrderPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleOrder = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/qikink/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: {
            id: "test123",
            sku: "MVnHs-Wh-S",
            printTypeId: 1,
            costPrice: 1,
            sellingPrice: 10,
            designLink:
              "https://sgp1.digitaloceanspaces.com/cdn.qikink.com/erp2/assets/designs/83/1696668376.jpg",
            mockupLink:
              "https://sgp1.digitaloceanspaces.com/cdn.qikink.com/erp2/assets/designs/83/1696668376.jpg",
            sellerId: "admin",
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
        setMessage("✅ Order Created Successfully!");
      } else {
        setMessage("❌ Order Failed");
        console.log(data);
      }

    } catch (error) {
      console.error(error);
      setMessage("❌ Server Error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md text-center w-80">

        <h1 className="text-xl font-bold mb-6">
          Qikink Order Test
        </h1>

        <button
          onClick={handleOrder}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded"
        >
          {loading ? "Processing..." : "Create Test Order"}
        </button>

        {message && (
          <p className="mt-4 text-sm font-semibold">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
 

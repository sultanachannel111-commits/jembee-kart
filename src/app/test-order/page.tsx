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
      });

      const data = await response.json();

      if (data.success) {
        setMessage("✅ Order Created Successfully!");
      } else {
        setMessage("❌ " + JSON.stringify(data));
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

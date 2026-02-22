"use client";

import { useState } from "react";

export default function TestOrderPage() {
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);

  const handleOrder = async () => {
    setLoading(true);
    setResponseData(null);

    try {
      const res = await fetch("/api/qikink/create-order", {
        method: "POST",
      });

      const data = await res.json();
      setResponseData(data);

    } catch (error) {
      setResponseData({
        success: false,
        error: "Frontend Fetch Error",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-5">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

        <h1 className="text-xl font-bold mb-6 text-center">
          Qikink Order Test
        </h1>

        <button
          onClick={handleOrder}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded"
        >
          {loading ? "Processing..." : "Create Test Order"}
        </button>

        {responseData && (
          <div className="mt-6 bg-gray-100 p-3 rounded text-sm overflow-auto max-h-60">
            <pre>{JSON.stringify(responseData, null, 2)}</pre>
          </div>
        )}

      </div>
    </div>
  );
}

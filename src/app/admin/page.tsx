"use client";

import { useState } from "react";
import AdminPushSetup from "@/components/AdminPushSetup"; // ✅ ADD KIYA

export default function AdminDashboard() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const createTestOrder = async () => {
    try {
      setLoading(true);
      setResult(null);

      const res = await fetch("/api/qikink-test", {
        method: "POST",
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">

      {/* ✅ PUSH SETUP AUTO RUN */}
      <AdminPushSetup />

      <h1 className="text-3xl font-bold text-pink-600 mb-6">
        Admin Dashboard
      </h1>

      <div className="bg-white p-6 rounded-xl shadow mb-8">
        Welcome to JembeeKart Admin Panel 🚀
      </div>

      {/* 🔥 Qikink Test Section */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Qikink Sandbox Test
        </h2>

        <button
          onClick={createTestOrder}
          className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          {loading ? "Creating Order..." : "Create Test Order"}
        </button>

        {result && (
          <pre className="mt-6 bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

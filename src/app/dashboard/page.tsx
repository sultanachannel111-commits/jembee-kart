"use client";

import Header from "@/components/header";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="font-semibold">Total Orders</h2>
            <p className="text-2xl font-bold mt-2">0</p>
          </div>

          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="font-semibold">Total Revenue</h2>
            <p className="text-2xl font-bold mt-2">₹0</p>
          </div>

          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="font-semibold">Total Products</h2>
            <p className="text-2xl font-bold mt-2">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}

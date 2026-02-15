"use client";

import { Header } from "@/components/header";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">
          Admin Dashboard
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2>Total Orders</h2>
            <p className="text-2xl font-bold">120</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2>Total Revenue</h2>
            <p className="text-2xl font-bold">₹85,000</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2>Pending Orders</h2>
            <p className="text-2xl font-bold">14</p>
          </div>
        </div>
      </div>
    </div>
  );
}

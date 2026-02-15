"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header";

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    setOrders([]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard Orders</h1>

        {orders.length === 0 ? (
          <p className="text-gray-500">No orders yet.</p>
        ) : (
          <div>Orders Table</div>
        )}
      </div>
    </div>
  );
}

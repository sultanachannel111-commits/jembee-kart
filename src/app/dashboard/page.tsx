"use client";

import Link from "next/link";
import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Orders</p>
            <h2 className="text-2xl font-bold">120</h2>
          </div>
          <ShoppingCart className="text-blue-600" size={28} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Products</p>
            <h2 className="text-2xl font-bold">45</h2>
          </div>
          <Package className="text-green-600" size={28} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Users</p>
            <h2 className="text-2xl font-bold">78</h2>
          </div>
          <Users className="text-purple-600" size={28} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Revenue</p>
            <h2 className="text-2xl font-bold">₹54,000</h2>
          </div>
          <TrendingUp className="text-orange-600" size={28} />
        </div>

      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

        <div className="flex flex-wrap gap-4">

          <Link
            href="/dashboard/orders"
            className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            View Orders
          </Link>

          <Link
            href="/product-optimizer"
            className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Product Optimizer
          </Link>

          <Link
            href="/"
            className="px-5 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
          >
            Go to Store
          </Link>

        </div>
      </div>

    </div>
  );
}

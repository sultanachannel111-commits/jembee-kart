"use client";

import Link from "next/link";
import { LayoutDashboard, ShoppingCart, Package, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg hidden md:flex flex-col">

        {/* Logo */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">
            JEMBEE <span className="text-green-600">ADMIN</span>
          </h2>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">

          <Link
            href="/dashboard"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link
            href="/dashboard/orders"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
          >
            <ShoppingCart size={18} />
            Orders
          </Link>

          <Link
            href="/product-optimizer"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
          >
            <Package size={18} />
            Products
          </Link>

        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <Link
            href="/"
            className="flex items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={18} />
            Exit Admin
          </Link>
        </div>

      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Top Bar */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>

          <Link
            href="/"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Go to Store
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>

      </div>
    </div>
  );
}

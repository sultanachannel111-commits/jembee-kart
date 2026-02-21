"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && role !== "seller") {
      router.replace("/");
    }
  }, [role, loading]);

  return (
    <div className="min-h-screen flex">

      {/* 🔥 Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 🔥 Sidebar */}
      <div
        className={`fixed md:static z-50 top-0 left-0 h-full w-64 bg-black text-white p-5 transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Seller Panel</h2>

          {/* Close button (mobile only) */}
          <button
            className="md:hidden text-white text-2xl"
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>
        </div>

        <nav className="space-y-4">
          <Link href="/seller" onClick={() => setSidebarOpen(false)}>Dashboard</Link>
          <Link href="/seller/orders" onClick={() => setSidebarOpen(false)}>My Orders</Link>
          <Link href="/seller/products" onClick={() => setSidebarOpen(false)}>My Products</Link>
          <Link href="/seller/add-product" onClick={() => setSidebarOpen(false)}>Add Product</Link>
          <Link href="/seller/revenue" onClick={() => setSidebarOpen(false)}>Revenue</Link>
        </nav>
      </div>

      {/* 🔥 Main Content */}
      <div className="flex-1 bg-gray-100 min-h-screen">

        {/* Top Bar */}
        <div className="bg-white p-4 shadow flex items-center md:hidden">
          <button
            className="text-2xl"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <h1 className="ml-4 font-semibold">Seller Dashboard</h1>
        </div>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

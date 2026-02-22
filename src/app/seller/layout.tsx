"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  PlusCircle,
  DollarSign,
  Menu,
  X,
} from "lucide-react";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && role !== "seller") {
      router.replace("/");
    }
  }, [role, loading]);

  const navItem = (href: string, label: string, Icon: any) => {
    const isActive = pathname === href;

    return (
      <Link
        href={href}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300
        ${
          isActive
            ? "bg-pink-600 text-white shadow-lg"
            : "text-gray-300 hover:bg-pink-500 hover:text-white"
        }`}
      >
        <Icon size={18} />
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* Overlay Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar FIXED */}
      <div
        className={`fixed md:static z-50 top-0 left-0 
        min-h-screen overflow-y-auto w-64 
        bg-black text-white p-5 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-pink-500">
            Jembee Seller
          </h2>

          <button
            className="md:hidden text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        <nav className="space-y-3">
          {navItem("/seller", "Dashboard", LayoutDashboard)}
          {navItem("/seller/orders", "My Orders", ShoppingCart)}
          {navItem("/seller/products", "My Products", Package)}
          {navItem("/seller/add-product", "Add Product", PlusCircle)}
          {navItem("/seller/revenue", "Revenue", DollarSign)}
        </nav>
      </div>

      {/* Main Area FIXED */}
      <div className="flex-1 min-h-screen overflow-y-auto">

        {/* Top Bar */}
        <div className="bg-white shadow p-4 flex items-center justify-between md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>

          <h1 className="font-semibold text-pink-600">
            Seller Panel
          </h1>
        </div>

        {/* Page Content */}
        <div className="p-6 animate-fadeIn">
          {children}
        </div>
      </div>
    </div>
  );
}

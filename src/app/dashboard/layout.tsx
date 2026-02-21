"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  LogIn,
  Menu,
  X,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItem = (href: string, label: string, Icon: any) => {
    const active = pathname === href;

    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
        ${
          active
            ? "bg-pink-600 text-white"
            : "text-gray-300 hover:bg-pink-500 hover:text-white"
        }`}
      >
        <Icon size={18} />
        {label}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-black text-white flex justify-between items-center p-4 z-50">
        <h2 className="font-bold text-pink-500">
          Seller Panel
        </h2>
        <button onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-black text-white p-6 space-y-4 transform transition-transform duration-300 z-40
        ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <h2 className="text-2xl font-bold text-pink-500 hidden md:block">
          Seller Panel
        </h2>

        <nav className="space-y-2 mt-8 md:mt-4">
          {navItem("/dashboard", "Dashboard", LayoutDashboard)}
          {navItem("/dashboard/products", "Products", Package)}
          {navItem("/dashboard/orders", "Orders", ShoppingCart)}
          {navItem("/dashboard/revenue", "Revenue", DollarSign)}

          {/* Divider */}
          <div className="border-t border-gray-700 my-4"></div>

          {/* Admin Login */}
          {navItem("/admin/login", "Admin Login", LogIn)}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 md:ml-0 mt-16 md:mt-0">
        {children}
      </main>
    </div>
  );
}

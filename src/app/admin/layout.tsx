"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Menu,
  X,
  LogOut,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  // 🔐 Admin Protection (No Blank Screen)
  useEffect(() => {
    const isLogged = localStorage.getItem("adminLoggedIn");

    if (isLogged === "true") {
      setAuthorized(true);
    } else {
      router.replace("/admin/login");
    }

    setChecking(false);
  }, [router]);

  const logout = () => {
    localStorage.removeItem("adminLoggedIn");
    router.push("/admin/login");
  };

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

  // 🛑 Prevent Blank Screen
  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen">
        Checking Admin Access...
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-black text-white flex justify-between items-center p-4 z-50">
        <h2 className="font-bold text-pink-500">
          Jembee Admin
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
          Jembee Admin
        </h2>

        <nav className="space-y-2 mt-8 md:mt-4">
          {navItem("/admin", "Dashboard", LayoutDashboard)}
          {navItem("/admin/products", "Products", Package)}
          {navItem("/admin/orders", "Orders", ShoppingCart)}
          {navItem("/admin/users", "Users", Users)}
          {navItem("/admin/categories", "Categories", Package)}
          {navItem("/admin/banners", "Banners", Package)}
          {navItem("/admin/festival", "Festival", Package)}
        </nav>

        {/* Logout */}
        <button
          onClick={logout}
          className="mt-10 flex items-center gap-2 text-red-400 hover:text-red-600 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 md:ml-0 mt-16 md:mt-0">
        {children}
      </main>
    </div>
  );
}

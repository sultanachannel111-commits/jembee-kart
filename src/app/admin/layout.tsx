"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Image,
  LogOut,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  // 🔐 Admin Protection
  useEffect(() => {
    // ✅ Allow login page without protection
    if (pathname === "/admin/login") {
      setAuthorized(true);
      setChecking(false);
      return;
    }

    const isLogged = localStorage.getItem("adminLoggedIn");

    if (isLogged === "true") {
      setAuthorized(true);
    } else {
      router.replace("/admin/login");
    }

    setChecking(false);
  }, [pathname, router]);

  const logout = () => {
    localStorage.removeItem("adminLoggedIn");
    router.push("/admin/login");
  };

  const navItem = (href: string, label: string, Icon: any) => {
    const active = pathname === href;

    return (
      <Link
        href={href}
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

  // 🔄 Loading state
  if (checking) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  // ❌ Not authorized
  if (!authorized) {
    return null;
  }

  // ❗ Login page should not show sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white p-6 space-y-6">
        <h2 className="text-2xl font-bold text-pink-500">
          Jembee Admin
        </h2>

        <nav className="space-y-2">
          {navItem("/admin", "Dashboard", LayoutDashboard)}
          {navItem("/admin/products", "Products", Package)}
          {navItem("/admin/orders", "Orders", ShoppingCart)}
          {navItem("/admin/users", "Users", Users)}
          {navItem("/admin/banners", "Banners", Image)}
        </nav>

        <button
          onClick={logout}
          className="mt-10 flex items-center gap-2 text-red-400 hover:text-red-600 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}

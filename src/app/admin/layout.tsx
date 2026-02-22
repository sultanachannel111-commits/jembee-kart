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

  // 🚨 IMPORTANT: Allow login page without protection
  useEffect(() => {
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

  if (checking) {
    return <div className="p-10">Loading...</div>;
  }

  if (!authorized) {
    return null;
  }

  // ❌ DO NOT show sidebar on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-black text-white p-6 space-y-4">
        <h2 className="text-2xl font-bold text-pink-500">
          Jembee Admin
        </h2>

        <nav className="space-y-2 mt-6">
          {navItem("/admin", "Dashboard", LayoutDashboard)}
          {navItem("/admin/products", "Products", Package)}
          {navItem("/admin/orders", "Orders", ShoppingCart)}
          {navItem("/admin/users", "Users", Users)}
        </nav>

        <button
          onClick={logout}
          className="mt-10 flex items-center gap-2 text-red-400"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}

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
  Menu,
  X,
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
  const [open, setOpen] = useState(false);

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
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition
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

  if (checking) return <div className="p-10">Loading...</div>;
  if (!authorized) return null;

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-black text-white flex justify-between items-center p-4 z-50">
        <h2 className="text-pink-500 font-bold">Jembee Admin</h2>
        <button onClick={() => setOpen(true)}>
          <Menu />
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-black text-white p-6 space-y-6 transform transition-transform duration-300 z-50
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex justify-between items-center md:hidden">
          <h2 className="text-pink-500 font-bold">Jembee Admin</h2>
          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>

        <nav className="space-y-2 mt-6">
          {navItem("/admin", "Dashboard", LayoutDashboard)}
          {navItem("/admin/products", "Products", Package)}
          {navItem("/admin/orders", "Orders", ShoppingCart)}
          {navItem("/admin/users", "Users", Users)}
          {navItem("/admin/banners", "Banners", Image)}
        </nav>

        <button
          onClick={logout}
          className="mt-10 flex items-center gap-2 text-red-400"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:ml-0 mt-16 md:mt-0">
        {children}
      </main>
    </div>
  );
}

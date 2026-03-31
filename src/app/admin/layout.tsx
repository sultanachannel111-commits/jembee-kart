"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Store,
  Tag,
  Settings,
  Image,
  Gift,
  LogOut
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();

  // 🔥 login page par layout hide
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const logout = () => {
    window.location.href = "/auth";
  };

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Products", icon: Package, path: "/admin/products" },
    { name: "Categories", icon: Tag, path: "/admin/categories" },
    { name: "Orders", icon: ShoppingCart, path: "/admin/orders" },
    { name: "Banners", icon: Image, path: "/admin/banners" },
    { name: "Festival Banner", icon: Gift, path: "/admin/festival" },
    { name: "Sellers", icon: Store, path: "/admin/sellers" },
    { name: "Users", icon: Users, path: "/admin/users" },
    { name: "Settings", icon: Settings, path: "/admin/settings" }
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-lg hidden md:flex flex-col">

        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-purple-600">
            JembeeKart
          </h1>
          <p className="text-xs text-gray-500">
            Admin Panel
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menu.map((item, index) => {
            const Icon = item.icon;
            const active = pathname === item.path;

            return (
              <Link
                key={index}
                href={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg
                ${active ? "bg-purple-100 text-purple-700" : "hover:bg-gray-100"}`}
              >
                <Icon size={18} />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

      </aside>

      {/* MAIN */}
      <div className="flex-1">

        {/* HEADER */}
        <div className="bg-white p-4 flex justify-between">
          <h2 className="font-semibold">Admin Dashboard</h2>

          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          {children}
        </div>

      </div>

    </div>
  );
}

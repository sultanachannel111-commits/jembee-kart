"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user]);

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-black text-white p-6 space-y-6">
        <h2 className="text-xl font-bold">Jembee Admin 👑</h2>

        <Link href="/dashboard">Dashboard</Link>
        <Link href="/dashboard/orders">Orders</Link>
        <Link href="/dashboard/products">Products</Link>
        <Link href="/dashboard/users">Users</Link>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        {children}
      </div>

    </div>
  );
}

"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role !== "seller") {
      router.replace("/");
    }
  }, [role, loading]);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white p-5 space-y-4">
        <h2 className="text-xl font-bold mb-6">Seller Panel</h2>

        <Link href="/seller" className="block">Dashboard</Link>
        <Link href="/seller/orders" className="block">My Orders</Link>
        <Link href="/seller/products" className="block">My Products</Link>
        <Link href="/seller/add-product" className="block">Add Product</Link>
        <Link href="/seller/revenue" className="block">Revenue</Link>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 bg-gray-100">
        {children}
      </div>
    </div>
  );
}

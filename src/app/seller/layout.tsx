"use client";

import Link from "next/link";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <div className="w-64 bg-black text-white p-6 space-y-4">

        <h2 className="text-xl font-bold text-pink-500">
          Seller Panel
        </h2>

        <Link href="/seller">Dashboard</Link>
        <Link href="/seller/add-product">Add Product</Link>
        <Link href="/seller/products">Products</Link>
        <Link href="/seller/orders">Orders</Link>
        <Link href="/seller/revenue">Revenue</Link>
        <Link href="/seller/account">Account</Link>

      </div>

      {/* Content */}
      <div className="flex-1 p-6 bg-gray-100">
        {children}
      </div>

    </div>
  );
}

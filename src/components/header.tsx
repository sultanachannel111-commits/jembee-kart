"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-white/30 backdrop-blur-lg border-b border-white/20 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-gray-800">
          JEMBEE <span className="text-green-600">KART</span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-6 text-gray-700 font-medium">
          <Link href="/">Home</Link>
          <Link href="/products/1">Products</Link>
          <Link href="/orders">Orders</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </div>
    </header>
  );
}

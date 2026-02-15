"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/60 border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-gray-800">
          JEMBEE <span className="text-green-600">STORE</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
          <Link href="/" className="hover:text-green-600 transition">
            Home
          </Link>
          <Link href="/orders" className="hover:text-green-600 transition">
            Orders
          </Link>
          <Link href="/dashboard" className="hover:text-green-600 transition">
            Dashboard
          </Link>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-4">

          {/* Cart Icon */}
          <Link
            href="/orders"
            className="p-2 rounded-full hover:bg-white/40 transition"
          >
            <ShoppingCart className="w-6 h-6 text-gray-700" />
          </Link>

          {/* WhatsApp Button */}
          <a
            href="https://wa.me/917061369212"
            target="_blank"
            className="hidden md:inline-block bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full font-medium shadow-md transition"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}

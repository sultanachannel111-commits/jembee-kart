"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full bg-white/70 backdrop-blur-lg shadow-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-gray-800">
          JEMBEE <span className="text-green-600">STORE</span> 🛍️
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-6">
          
          {/* WhatsApp */}
          <a
            href="https://wa.me/917061369212"
            target="_blank"
            className="hidden sm:block bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm shadow-md transition"
          >
            WhatsApp 💬
          </a>

          {/* Cart */}
          <Link href="/cart" className="relative">
            <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-green-600 transition" />
          </Link>

          {/* Admin Login */}
          <Link
            href="/auth/login"
            className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Admin
          </Link>

        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-gray-800">
          jembee <span className="text-pink-600">kart</span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-4">

          {/* Login / Logout */}
          {user ? (
            <button
              onClick={logout}
              className="px-5 py-2 rounded-full font-medium text-white bg-black hover:bg-gray-800 transition"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2 rounded-full font-medium text-white bg-black hover:bg-gray-800 transition"
            >
              Login
            </Link>
          )}

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative p-2 rounded-full hover:bg-gray-100 transition"
          >
            <ShoppingCart className="w-6 h-6 text-gray-700" />

            {/* Cart Badge */}
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

        </div>
      </div>
    </header>
  );
}

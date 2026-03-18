"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useCart } from "@/context/CartContext";

export default function Header({ theme }: any) {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  console.log("🔥 HEADER THEME:", theme);

  return (
    <header
      style={{
        background: theme?.header || "#ffffff",
        backgroundImage: "none", // 🔥 gradient kill
      }}
      className="sticky top-0 z-50 w-full shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* 🔹 Logo */}
        <Link
          href="/"
          className="text-2xl font-bold"
          style={{
            color: "#000",
          }}
        >
          Jembee
          <span
            style={{
              color: theme?.button || "#ec4899",
            }}
          >
            Kart
          </span>
        </Link>

        {/* 🔹 Right Section */}
        <div className="flex items-center gap-4">

          {/* Login / Logout */}
          {user ? (
            <button
              onClick={logout}
              style={{
                background: theme?.button || "#000",
                color: "#fff",
              }}
              className="px-4 py-2 rounded-full font-medium"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              style={{
                background: theme?.button || "#000",
                color: "#fff",
              }}
              className="px-4 py-2 rounded-full font-medium"
            >
              Login
            </Link>
          )}

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative p-2 rounded-full"
          >
            <ShoppingCart
              className="w-6 h-6"
              style={{ color: "#000" }}
            />

            {/* 🔴 Cart Badge */}
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                {cartCount}
              </span>
            )}
          </Link>

        </div>
      </div>
    </header>
  );
}

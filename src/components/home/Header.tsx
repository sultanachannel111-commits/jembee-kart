"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Header({ theme }: any) {
  const { cartCount } = useCart();

  // 🔥 BACKGROUND LOGIC (GRADIENT SUPPORT)
  const headerBg = theme?.gradient
    ? `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`
    : theme?.header || "#111111";

  // 🔥 TEXT COLOR AUTO (LIGHT/DARK FIX)
  const textColor = "#ffffff";

  return (
    <header
      style={{
        background: headerBg,
        color: textColor,
        backdropFilter: "blur(10px)"
      }}
      className="fixed top-0 left-0 right-0 z-50 px-4 h-[72px] flex items-center justify-between shadow-lg border-b border-white/10 transition-all duration-300"
    >

      {/* 🔥 LOGO */}
      <h1 className="text-xl font-bold flex items-center gap-1">
        <span className="tracking-wide">Jembee</span>

        <span
          style={{
            color: theme?.button || "#22c55e"
          }}
          className="font-extrabold"
        >
          Kart
        </span>
      </h1>

      {/* 🔥 CART */}
      <Link href="/cart" className="relative">

        <div className="relative">

          <ShoppingCart size={22} />

          {/* 🔥 BADGE */}
          {cartCount > 0 && (
            <span
              style={{
                background: theme?.button || "#22c55e",
                boxShadow: `0 0 10px ${theme?.button || "#22c55e"}`
              }}
              className="absolute -top-2 -right-2 text-white text-xs px-1.5 py-0.5 rounded-full animate-pulse"
            >
              {cartCount}
            </span>
          )}

        </div>

      </Link>

    </header>
  );
}

"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";

export default function Header({ theme }: any) {
  const { cartCount } = useCart();

  const [hideHeader, setHideHeader] = useState(false);

  useEffect(() => {
    let lastScroll = 0;

    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScroll && currentScroll > 50) {
        setHideHeader(true);
      } else {
        setHideHeader(false);
      }

      lastScroll = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      style={{
        background: theme?.header || "#111111",
        color: "#ffffff",
      }}
      className={`fixed top-0 left-0 right-0 z-50 px-4 h-[72px] flex items-center justify-between shadow-md transition-transform duration-300 ${
        hideHeader ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* LOGO */}
      <h1 className="text-xl font-bold flex items-center">
        <span>Jembee</span>
        <span style={{ color: theme?.button || "#ff0000" }}>
          Kart
        </span>
      </h1>

      {/* CART */}
      <Link href="/cart" className="relative">
        <ShoppingCart size={22} />

        {cartCount > 0 && (
          <span
            style={{ background: theme?.button || "#ff0000" }}
            className="absolute -top-2 -right-2 text-white text-xs px-1.5 py-0.5 rounded-full"
          >
            {cartCount}
          </span>
        )}
      </Link>
    </header>
  );
}

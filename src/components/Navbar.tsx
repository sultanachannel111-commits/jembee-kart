"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Grid, ShoppingCart, User } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCartCount(0);
        return;
      }

      const itemsRef = collection(db, "cart", user.uid, "items");

      const unsubscribeCart = onSnapshot(itemsRef, (snap) => {
        let total = 0;

        snap.forEach((doc) => {
          total += doc.data().quantity || 0;
        });

        setCartCount(total);
      });

      return () => unsubscribeCart();
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
      <div className="backdrop-blur-xl bg-white/30 border border-white/40 shadow-2xl rounded-2xl flex justify-around py-3 px-4">

        <NavItem href="/" icon={<Home size={20} />} label="Home" />

        <NavItem href="/categories" icon={<Grid size={20} />} label="Categories" />

        {/* 🔥 CART WITH ANIMATED BADGE */}
        <Link
          href="/cart"
          className="relative flex flex-col items-center text-xs text-gray-800"
        >
          <ShoppingCart size={20} />
          <span className="mt-1">Cart</span>

          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] px-2 py-[2px] rounded-full animate-bounce shadow-md">
              {cartCount}
            </span>
          )}
        </Link>

        <NavItem href="/profile" icon={<User size={20} />} label="Profile" />
      </div>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center text-xs text-gray-800 hover:scale-110 transition-transform duration-200"
    >
      {icon}
      <span className="mt-1">{label}</span>
    </Link>
  );
}

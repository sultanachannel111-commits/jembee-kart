"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Home, Grid, User } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    let unsubscribeCart: any = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCartCount(0);
        if (unsubscribeCart) unsubscribeCart();
        return;
      }

      const cartRef = collection(db, "cart", user.uid, "items");

      unsubscribeCart = onSnapshot(cartRef, (snapshot) => {
        let total = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          total += Number(data.quantity || 0);
        });

        setCartCount(total);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeCart) unsubscribeCart();
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t shadow-lg p-4 flex justify-around items-center z-50">

      <Link href="/" className="flex flex-col items-center text-xs text-gray-700">
        <Home size={22} />
        <span>Home</span>
      </Link>

      <Link href="/categories" className="flex flex-col items-center text-xs text-gray-700">
        <Grid size={22} />
        <span>Categories</span>
      </Link>

      {/* 🔥 CART WITH FIXED COUNT BADGE */}
      <Link href="/cart" className="relative flex flex-col items-center text-xs text-gray-700">
        <ShoppingCart size={22} />
        <span>Cart</span>

        {cartCount > 0 && (
          <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full animate-bounce shadow-md">
            {cartCount}
          </span>
        )}
      </Link>

      <Link href="/profile" className="flex flex-col items-center text-xs text-gray-700">
        <User size={22} />
        <span>Profile</span>
      </Link>

    </div>
  );
}

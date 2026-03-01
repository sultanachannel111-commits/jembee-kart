"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Home, User, Grid } from "lucide-react";
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex justify-around py-3 z-50">

      <Link href="/" className="flex flex-col items-center text-xs">
        <Home size={20} />
        Home
      </Link>

      <Link href="/categories" className="flex flex-col items-center text-xs">
        <Grid size={20} />
        Categories
      </Link>

      {/* 🔥 CART WITH LIVE BADGE */}
      <Link href="/cart" className="relative flex flex-col items-center text-xs">
        <ShoppingCart size={20} />
        Cart

        {cartCount > 0 && (
          <span className="absolute -top-1 right-4 bg-red-600 text-white text-[10px] px-2 py-[2px] rounded-full">
            {cartCount}
          </span>
        )}
      </Link>

      <Link href="/profile" className="flex flex-col items-center text-xs">
        <User size={20} />
        Profile
      </Link>
    </div>
  );
}

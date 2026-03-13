"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    let unsubscribeCart: any;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCartCount(0);
        if (unsubscribeCart) unsubscribeCart();
        return;
      }

      // 🔥 EXACT SAME PATH AS CART PAGE
      const cartItemsRef = collection(db, "cart", user.uid, "items");

      unsubscribeCart = onSnapshot(cartItemsRef, (snapshot) => {
        let total = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          total += Number(data.quantity || 0);
        });

        console.log("LIVE CART COUNT:", total); // 🔍 DEBUG

        setCartCount(total);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeCart) unsubscribeCart();
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50">
      <Link href="/cart" className="relative">
        <ShoppingCart size={28} />

        {cartCount > 0 && (
          <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs min-w-[20px] h-[20px] flex items-center justify-center rounded-full">
            {cartCount}
          </span>
        )}
      </Link>
    </div>
  );
}

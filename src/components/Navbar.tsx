"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Navbar() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    let unsubscribeCart: any;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCount(0);
        if (unsubscribeCart) unsubscribeCart();
        return;
      }

      const cartRef = collection(db, "cart", user.uid, "items");

      unsubscribeCart = onSnapshot(cartRef, (snapshot) => {
        let total = 0;
        snapshot.forEach((doc) => {
          total += Number(doc.data().quantity || 0);
        });

        setCount(total);
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

        {count > 0 && (
          <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs min-w-[20px] h-[20px] flex items-center justify-center rounded-full animate-pulse">
            {count}
          </span>
        )}
      </Link>
    </div>
  );
}

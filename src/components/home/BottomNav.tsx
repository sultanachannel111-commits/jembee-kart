"use client";

import Link from "next/link";
import { Home, Gift, Flame, User } from "lucide-react";

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2">

      {/* Home */}
      <Link href="/" className="flex flex-col items-center text-xs">
        <Home size={20} />
        Home
      </Link>

      {/* Wish Maker */}
      <Link href="/create" className="flex flex-col items-center text-xs">
        <Gift size={20} />
        Wishes
      </Link>

      {/* Offers */}
      <Link href="/offers" className="flex flex-col items-center text-xs">
        <Flame size={20} />
        Offers
      </Link>

      {/* Profile */}
      <Link href="/profile" className="flex flex-col items-center text-xs">
        <User size={20} />
        Profile
      </Link>

    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function Header() {
  const [showLogin, setShowLogin] = useState(false);
  const [clicked, setClicked] = useState(false);

  const handleLoginClick = () => {
    setClicked(true);

    setTimeout(() => {
      setClicked(false);
      setShowLogin(true);
    }, 200);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gray-800">
            jembee <span className="text-pink-600">kart</span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-4">

            {/* Login Button */}
            <button
              onClick={handleLoginClick}
              className={`px-5 py-2 rounded-full font-medium text-white transition
              ${
                clicked
                  ? "bg-gray-400"
                  : "bg-black hover:bg-gray-800"
              }`}
            >
              Login
            </button>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
            </Link>
          </div>
        </div>
      </header>

      {/* LOGIN POPUP */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl w-72 text-center shadow-2xl">

            <h3 className="text-lg font-semibold mb-6">
              Select Login Type
            </h3>

            <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg mb-3 transition">
              Customer Login
            </button>

            <button className="w-full bg-black hover:bg-gray-800 text-white py-2 rounded-lg transition">
              Seller Login
            </button>

            <button
              onClick={() => setShowLogin(false)}
              className="mt-5 text-gray-500 text-sm"
            >
              Close
            </button>

          </div>
        </div>
      )}
    </>
  );
}

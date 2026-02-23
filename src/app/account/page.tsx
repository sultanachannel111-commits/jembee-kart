"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AccountClient() {
  const { user, role, logout } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  // ✅ Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  // ✅ If not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
        <h2 className="text-2xl font-bold">Login As</h2>

        <button
          onClick={() => router.push("/login?role=customer")}
          className="w-60 bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition"
        >
          Customer Login
        </button>

        <button
          onClick={() => router.push("/login?role=seller")}
          className="w-60 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
        >
          Seller Login
        </button>
      </div>
    );
  }

  // ✅ Logged in view
  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow space-y-4">

        <h2 className="text-2xl font-bold text-center">My Account</h2>

        <div className="text-sm text-gray-600">
          <p><b>Email:</b> {user.email}</p>
          <p><b>Role:</b> {role}</p>
        </div>

        {/* ✅ Seller dashboard button */}
        {role === "seller" && (
          <button
            onClick={() => router.push("/seller-dashboard")}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
          >
            Go to Seller Dashboard
          </button>
        )}

        {/* ✅ Logout */}
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>

      </div>
    </div>
  );
}

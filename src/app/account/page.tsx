"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AccountPage() {
  const { user, logout, loginAsGuest } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<"customer" | "seller" | null>(null);

  // 🔹 Not Logged In
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">

        <h2 className="text-2xl font-bold">Account</h2>

        <button
          onClick={() => {
            setRole("customer");
            router.push("/login");
          }}
          className="w-60 bg-pink-600 text-white py-3 rounded-lg"
        >
          Customer Login
        </button>

        <button
          onClick={() => {
            setRole("seller");
            router.push("/login");
          }}
          className="w-60 bg-black text-white py-3 rounded-lg"
        >
          Seller Login
        </button>

      </div>
    );
  }

  // 🔹 Logged In
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6 space-y-4">

        <h2 className="text-2xl font-bold text-center">
          My Account
        </h2>

        <p>
          <span className="font-semibold">Email:</span>{" "}
          {user.email || "Guest User"}
        </p>

        <p>
          <span className="font-semibold">Role:</span>{" "}
          {role || "Customer"}
        </p>

        <button
          onClick={logout}
          className="w-full bg-red-500 text-white py-2 rounded-lg"
        >
          Logout
        </button>

      </div>
    </div>
  );
}

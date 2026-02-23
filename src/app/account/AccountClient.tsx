"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";

export default function AccountClient() {
  const { user, role, logout } = useAuth();
  const router = useRouter();

  // If not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
        <h2 className="text-2xl font-bold">Login As</h2>

        <button
          onClick={() => router.push("/login?role=customer")}
          className="w-60 bg-pink-600 text-white py-3 rounded-lg"
        >
          Customer Login
        </button>

        <button
          onClick={() => router.push("/login?role=seller")}
          className="w-60 bg-black text-white py-3 rounded-lg"
        >
          Seller Login
        </button>
      </div>
    );
  }

  // Logged in
  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow space-y-4">

        <h2 className="text-2xl font-bold text-center">My Account</h2>

        <div className="text-sm text-gray-600">
          <p><b>Email:</b> {user.email}</p>
          <p><b>Role:</b> {role}</p>
        </div>

        {role === "seller" && (
          <button
            onClick={() => router.push("/seller-dashboard")}
            className="w-full bg-black text-white py-2 rounded"
          >
            Go to Seller Dashboard
          </button>
        )}

        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="w-full bg-red-500 text-white py-2 rounded"
        >
          Logout
        </button>

      </div>
    </div>
  );
}

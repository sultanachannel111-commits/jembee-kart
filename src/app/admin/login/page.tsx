"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 🔒 Hardcoded Credentials
  const ADMIN_USER = "sadiyabashar7910";
  const ADMIN_PASS = "Pintu@7910";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (userId === ADMIN_USER && password === ADMIN_PASS) {
      localStorage.setItem("adminLoggedIn", "true");
      router.push("/admin/dashboard");
    } else {
      setError("Invalid User ID or Password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-400 via-orange-300 to-pink-400 p-4">
      <div className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-md">

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Admin Login
        </h2>

        <p className="text-center text-gray-500 mb-6">
          Welcome to JEMBEE KART Dashboard
        </p>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">

          {/* User ID */}
          <div>
            <label className="block text-sm font-medium mb-1">
              User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter User ID"
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-yellow-400 outline-none transition"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-yellow-400 outline-none transition"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm text-center">
              {error}
            </p>
          )}

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-semibold shadow-lg transition duration-300"
          >
            Login
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 JEMBEE KART | Secure Admin Panel
        </p>
      </div>
    </div>
  );
}

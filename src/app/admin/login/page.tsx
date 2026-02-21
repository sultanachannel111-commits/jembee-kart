"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔒 Hardcoded Credentials (Demo Mode)
  const ADMIN_USER = "sadiyabashar7910";
  const ADMIN_PASS = "Pintu@7910";

  // 🔁 Auto Redirect if already logged in
  useEffect(() => {
    const isLogged = localStorage.getItem("adminLoggedIn");
    if (isLogged === "true") {
      router.replace("/admin");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Fake delay for better UX
    setTimeout(() => {
      if (userId === ADMIN_USER && password === ADMIN_PASS) {
        localStorage.setItem("adminLoggedIn", "true");
        router.push("/admin"); // ✅ Correct route
      } else {
        setError("Invalid User ID or Password");
      }
      setLoading(false);
    }, 700);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">

        <h2 className="text-3xl font-bold text-center mb-2 text-black">
          Admin Login
        </h2>

        <p className="text-center text-gray-500 mb-6">
          Welcome to JEMBEE KART Dashboard
        </p>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="block text-sm font-medium mb-1">
              User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter User ID"
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-pink-500 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-pink-500 outline-none transition"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg font-semibold shadow-lg transition duration-300"
          >
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 JEMBEE KART | Secure Admin Panel
        </p>
      </div>
    </div>
  );
}

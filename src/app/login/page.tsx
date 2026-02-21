"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const {
    loginWithGoogle,
    registerWithEmail,
    loginWithEmail,
    loginAsGuest,
  } = useAuth();

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAction = async (action: Function) => {
    try {
      setLoading(true);
      setError("");
      await action();
      router.push("/");
    } catch (err) {
      setError("Authentication failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-xl shadow-md w-80 space-y-4">

        <h2 className="text-xl font-bold text-center">Login</h2>

        {error && (
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={() => handleAction(() => loginWithEmail(email, password))}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded"
        >
          {loading ? "Please wait..." : "Login"}
        </button>

        <button
          onClick={() =>
            handleAction(() => registerWithEmail(email, password))
          }
          disabled={loading}
          className="w-full bg-gray-700 text-white py-2 rounded"
        >
          Register
        </button>

        <button
          onClick={() => handleAction(loginWithGoogle)}
          disabled={loading}
          className="w-full bg-red-500 text-white py-2 rounded"
        >
          Login with Google
        </button>

        <button
          onClick={() => handleAction(loginAsGuest)}
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 rounded"
        >
          Continue as Guest
        </button>

      </div>
    </div>
  );
}

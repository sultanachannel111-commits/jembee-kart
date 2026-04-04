"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {

  const router = useRouter();
  const params = useSearchParams();

  const redirect = params.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 🔥 AUTH CHECK
  useEffect(() => {

    const unsub = onAuthStateChanged(auth, (user) => {

      console.log("🔐 LOGIN USER:", user);

      if (user) {
        console.log("➡️ REDIRECT TO:", redirect);

        // 🔥 slight delay for smoother UX
        setTimeout(() => {
          router.push(redirect);
        }, 300);
      }

      setCheckingAuth(false);
    });

    return () => unsub();

  }, [router, redirect]);

  // 🔐 LOGIN FUNCTION
  const handleLogin = async () => {

    if (!email || !password) {
      alert("Fill all fields ❌");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(auth, email, password);

      console.log("✅ Login success");

      // redirect auto handle ho raha hai useEffect se

    } catch (err: any) {

      console.log("🔥 LOGIN ERROR:", err);

      // 🔥 better message
      if (err.code === "auth/user-not-found") {
        alert("User not found ❌");
      } else if (err.code === "auth/wrong-password") {
        alert("Wrong password ❌");
      } else if (err.code === "auth/invalid-email") {
        alert("Invalid email ❌");
      } else {
        alert(err.message);
      }

    } finally {
      setLoading(false);
    }
  };

  // ⏳ AUTH LOADING
  if (checkingAuth) {
    return (
      <div className="p-5 text-center text-gray-500">
        Checking login...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-white">

      <div className="bg-white p-6 rounded-2xl shadow-lg w-[90%] max-w-sm">

        <h1 className="text-2xl font-bold mb-5 text-center">
          Login 🔐
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-purple-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-purple-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-semibold ${
            loading
              ? "bg-gray-400"
              : "bg-gradient-to-r from-purple-600 to-pink-500"
          }`}
        >
          {loading ? "Logging in..." : "Login 🚀"}
        </button>

      </div>
    </div>
  );
}

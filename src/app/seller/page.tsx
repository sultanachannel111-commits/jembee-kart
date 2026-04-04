*Seller page* 

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

  // 🔥 AUTH CHECK (IMPORTANT)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      console.log("🔐 LOGIN USER:", user);

      if (user) {
        console.log("➡️ REDIRECT TO:", redirect);
        router.push(redirect); // 🔥 dynamic redirect
      }

      setCheckingAuth(false);
    });

    return () => unsub();
  }, []);

  // 🔐 LOGIN FUNCTION
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Fill all fields");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(auth, email, password);

      // 🔥 redirect handled automatically by useEffect

    } catch (err: any) {
      console.log("🔥 LOGIN ERROR:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ⏳ CHECKING AUTH
  if (checkingAuth) {
    return <div className="p-5 text-center">Checking login...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-6 rounded-xl shadow w-[90%] max-w-sm">

        <h1 className="text-xl font-bold mb-4 text-center">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white py-2 rounded"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </div>
    </div>
  );
}

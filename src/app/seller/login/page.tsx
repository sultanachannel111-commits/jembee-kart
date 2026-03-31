"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SellerLoginPage() {

  const router = useRouter();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);
  const [checking,setChecking] = useState(true);

  // 🔥 IMPORTANT FIX (redirect control)
  useEffect(() => {

    const unsub = onAuthStateChanged(auth, (user) => {

      console.log("🔐 AUTH STATE:", user);

      if (user) {
        console.log("➡️ Redirecting to seller dashboard");
        router.replace("/seller/dashboard"); // ✅ FIX
      }

      setChecking(false);
    });

    return () => unsub();

  }, []);

  const login = async (e:any) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Fill all fields");
      return;
    }

    try {

      setLoading(true);

      const res = await signInWithEmailAndPassword(auth,email,password);

      console.log("✅ LOGIN SUCCESS:", res.user);

      // 🔥 IMPORTANT (cookie for middleware)
      document.cookie = "seller=true; path=/";

      // 🔥 DIRECT FORCE REDIRECT
      window.location.href = "/seller/dashboard";

    } catch (err:any) {
      console.log("❌ LOGIN ERROR:", err);
      alert("Login failed");
    }

    setLoading(false);
  };

  if (checking) {
    return <div className="p-5 text-center">Checking auth...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <form
        onSubmit={login}
        className="bg-white p-6 rounded-xl shadow w-[90%] max-w-sm space-y-4"
      >

        <h1 className="text-xl font-bold text-center">
          Seller Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>

    </div>
  );
}

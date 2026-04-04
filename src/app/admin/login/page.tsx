"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminLogin() {

  const router = useRouter();

  const [error, setError] = useState("");

  // 🔥 GOOGLE LOGIN
  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      console.log("✅ Logged in:", user.email);

      // 🔐 ADMIN CHECK (YAHAN APNA EMAIL DALNA)
      if (user.email === "sadiyabashar113@gmail.com") {

        // secure cookie set
        document.cookie = "admin=true; path=/";

        router.push("/admin");

      } else {

        setError("Not an admin ❌");

      }

    } catch (err) {
      console.log(err);
      setError("Google login failed ❌");
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 p-4">

      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-sm">

        <h1 className="text-3xl font-bold text-center text-gray-800">
          Admin Login
        </h1>

        <p className="text-center text-gray-500 mt-1 mb-6">
          JembeeKart Admin Panel
        </p>

        {/* 🔥 GOOGLE BUTTON */}
        <button
          onClick={login}
          className="w-full bg-white text-black py-3 rounded-xl font-semibold shadow hover:opacity-90 flex items-center justify-center gap-2"
        >
          🔵 Login with Google
        </button>

        {error && (
          <p className="text-red-500 text-sm text-center mt-4">
            {error}
          </p>
        )}

      </div>

    </div>

  );

}

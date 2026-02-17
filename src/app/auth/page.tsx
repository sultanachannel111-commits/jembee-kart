"use client";

import { useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const [role, setRole] = useState<"seller" | "customer">("customer");
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }

      if (role === "seller") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);

      if (role === "seller") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return alert("Enter your email first");
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-6">
          {role === "seller" ? "Seller" : "Customer"} {isLogin ? "Login" : "Signup"}
        </h2>

        {/* Role Switch */}
        <div className="flex mb-6 rounded-lg overflow-hidden border">
          <button
            onClick={() => setRole("customer")}
            className={`flex-1 py-2 ${
              role === "customer"
                ? "bg-yellow-400 font-semibold"
                : "bg-gray-100"
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => setRole("seller")}
            className={`flex-1 py-2 ${
              role === "seller"
                ? "bg-yellow-400 font-semibold"
                : "bg-gray-100"
            }`}
          >
            Seller
          </button>
        </div>

        {/* Email */}
        <input
          type="email"
          placeholder="Enter Email"
          className="w-full p-3 mb-4 border rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Enter Password"
          className="w-full p-3 mb-4 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Login / Signup Button */}
        <button
          onClick={handleAuth}
          className="w-full bg-yellow-400 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition"
        >
          {isLogin ? "Login" : "Create Account"}
        </button>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full mt-3 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
        >
          Continue with Google
        </button>

        {/* Toggle */}
        <p className="text-center mt-4 text-sm">
          {isLogin ? "Don't have account?" : "Already have account?"}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 ml-2 cursor-pointer font-semibold"
          >
            {isLogin ? "Signup" : "Login"}
          </span>
        </p>

        {/* Forgot */}
        {isLogin && (
          <p
            onClick={handleForgotPassword}
            className="text-center mt-3 text-sm text-red-500 cursor-pointer"
          >
            Forgot Password?
          </p>
        )}
      </div>
    </div>
  );
}

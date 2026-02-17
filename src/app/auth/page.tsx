"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"seller" | "customer">("customer");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      if (isLogin) {
        // LOGIN
        await signInWithEmailAndPassword(auth, email, password);

        if (role === "seller") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      } else {
        // SIGNUP
        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        // Save role in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email,
          role,
          createdAt: new Date(),
        });

        if (role === "seller") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Enter your email first");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset link sent to your email");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f3f6]">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? "Login" : "Create Account"}
        </h2>

        {/* ROLE SELECT */}
        <div className="flex gap-4 mb-4 justify-center">
          <button
            onClick={() => setRole("customer")}
            className={`px-4 py-2 rounded ${
              role === "customer"
                ? "bg-yellow-400"
                : "bg-gray-200"
            }`}
          >
            Customer
          </button>

          <button
            onClick={() => setRole("seller")}
            className={`px-4 py-2 rounded ${
              role === "seller"
                ? "bg-yellow-400"
                : "bg-gray-200"
            }`}
          >
            Seller
          </button>
        </div>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Enter Email"
          className="w-full mb-4 px-4 py-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Enter Password"
          className="w-full mb-2 px-4 py-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* FORGOT PASSWORD */}
        {isLogin && (
          <p
            onClick={handleForgotPassword}
            className="text-sm text-red-500 cursor-pointer mb-4"
          >
            Forgot Password?
          </p>
        )}

        {/* LOGIN / SIGNUP BUTTON */}
        <button
          onClick={handleAuth}
          className="w-full bg-yellow-400 py-2 rounded font-semibold hover:bg-yellow-500 transition"
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>

        {/* TOGGLE */}
        <p className="text-center mt-4 text-sm">
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 cursor-pointer ml-1"
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>

      </div>
    </div>
  );
}

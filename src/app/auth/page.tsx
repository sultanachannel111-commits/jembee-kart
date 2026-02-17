"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("customer");

  // SIGNUP
  const handleSignup = async () => {
    try {
      const userCredential =
        await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        role,
      });

      alert("Signup Successful");
      router.push("/");
    } catch (error: any) {
      alert(error.message);
    }
  };

  // LOGIN
  const handleLogin = async () => {
    try {
      const userCredential =
        await signInWithEmailAndPassword(auth, email, password);

      const userDoc = await getDoc(
        doc(db, "users", userCredential.user.uid)
      );

      const userRole = userDoc.data()?.role;

      if (userRole === "seller") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? "Login" : "Signup"}
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-3 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-3 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {!isLogin && (
          <select
            className="w-full mb-3 p-3 border rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="customer">Customer</option>
            <option value="seller">Seller</option>
          </select>
        )}

        <button
          onClick={isLogin ? handleLogin : handleSignup}
          className="w-full bg-yellow-500 text-white py-3 rounded font-semibold"
        >
          {isLogin ? "Login" : "Signup"}
        </button>

        <p
          className="text-center mt-4 cursor-pointer text-blue-600"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Don't have account? Signup"
            : "Already have account? Login"}
        </p>
      </div>
    </div>
  );
}

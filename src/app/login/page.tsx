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

  const [loadingType, setLoadingType] = useState<
    "login" | "register" | "google" | "guest" | null
  >(null);

  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      setLoadingType("login");
      setMessage("");

      await loginWithEmail(email, password);

      setMessage("Login Successful ✅");

      setTimeout(() => {
        router.replace("/");
      }, 800);
    } catch (err: any) {
      console.log(err);
      setMessage("Login Failed ❌");
    } finally {
      setLoadingType(null);
    }
  };

  const handleRegister = async () => {
    try {
      setLoadingType("register");
      setMessage("");

      await registerWithEmail(email, password);

      setMessage("Registration Successful ✅");

      setTimeout(() => {
        router.replace("/");
      }, 800);
    } catch (err: any) {
      console.log(err);
      setMessage("Registration Failed ❌");
    } finally {
      setLoadingType(null);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoadingType("google");
      setMessage("");

      await loginWithGoogle();

      setMessage("Google Login Successful ✅");

      setTimeout(() => {
        router.replace("/");
      }, 800);
    } catch (err) {
      setMessage("Google Login Failed ❌");
    } finally {
      setLoadingType(null);
    }
  };

  const handleGuest = async () => {
    try {
      setLoadingType("guest");
      setMessage("");

      await loginAsGuest();

      setMessage("Guest Login Successful ✅");

      setTimeout(() => {
        router.replace("/");
      }, 800);
    } catch (err) {
      setMessage("Guest Login Failed ❌");
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-xl shadow-md w-80 space-y-4">

        <h2 className="text-xl font-bold text-center">Login</h2>

        {message && (
          <div className="text-center text-sm font-medium">
            {message}
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
          onClick={handleLogin}
          disabled={loadingType !== null}
          className="w-full bg-black text-white py-2 rounded"
        >
          {loadingType === "login" ? "Please wait..." : "Login"}
        </button>

        <button
          onClick={handleRegister}
          disabled={loadingType !== null}
          className="w-full bg-gray-700 text-white py-2 rounded"
        >
          {loadingType === "register" ? "Please wait..." : "Register"}
        </button>

        <button
          onClick={handleGoogle}
          disabled={loadingType !== null}
          className="w-full bg-red-500 text-white py-2 rounded"
        >
          {loadingType === "google"
            ? "Please wait..."
            : "Login with Google"}
        </button>

        <button
          onClick={handleGuest}
          disabled={loadingType !== null}
          className="w-full bg-green-500 text-white py-2 rounded"
        >
          {loadingType === "guest"
            ? "Please wait..."
            : "Continue as Guest"}
        </button>

      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const {
    user,
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

  const [message, setMessage] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });

  // ✅ Redirect after success
  useEffect(() => {
    if (user) {
      setMessage({
        type: "success",
        text: "Authentication Successful ✅",
      });

      setTimeout(() => {
        router.replace("/");
      }, 1000);
    }
  }, [user, router]);

  const handleAction = async (
    type: "login" | "register" | "google" | "guest",
    action: () => Promise<void>
  ) => {
    try {
      setLoadingType(type);
      setMessage({ type: null, text: "" });

      await action();
    } catch (err) {
      console.log(err);

      setMessage({
        type: "error",
        text: "Authentication Failed ❌",
      });
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-xl shadow-md w-80 space-y-4">

        <h2 className="text-xl font-bold text-center">Login</h2>

        {message.type && (
          <div
            className={`text-center text-sm font-medium ${
              message.type === "success"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message.text}
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
          onClick={() =>
            handleAction("login", () =>
              loginWithEmail(email, password)
            )
          }
          disabled={loadingType !== null}
          className="w-full bg-black text-white py-2 rounded"
        >
          {loadingType === "login" ? "Please wait..." : "Login"}
        </button>

        <button
          onClick={() =>
            handleAction("register", () =>
              registerWithEmail(email, password)
            )
          }
          disabled={loadingType !== null}
          className="w-full bg-gray-700 text-white py-2 rounded"
        >
          {loadingType === "register" ? "Please wait..." : "Register"}
        </button>

        <button
          onClick={() =>
            handleAction("google", loginWithGoogle)
          }
          disabled={loadingType !== null}
          className="w-full bg-red-500 text-white py-2 rounded"
        >
          {loadingType === "google"
            ? "Please wait..."
            : "Login with Google"}
        </button>

        <button
          onClick={() =>
            handleAction("guest", loginAsGuest)
          }
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

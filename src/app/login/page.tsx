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

  const handleAction = async (
    type: "login" | "register" | "google" | "guest",
    action: () => Promise<void>
  ) => {
    try {
      setLoadingType(type);
      await action();
      router.replace("/");
    } catch (err) {
      console.log(err); // silent error
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-xl shadow-md w-80 space-y-4">

        <h2 className="text-xl font-bold text-center">Login</h2>

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
          {loadingType === "google" ? "Please wait..." : "Login with Google"}
        </button>

        <button
          onClick={() =>
            handleAction("guest", loginAsGuest)
          }
          disabled={loadingType !== null}
          className="w-full bg-green-500 text-white py-2 rounded"
        >
          {loadingType === "guest" ? "Please wait..." : "Continue as Guest"}
        </button>

      </div>
    </div>
  );
}

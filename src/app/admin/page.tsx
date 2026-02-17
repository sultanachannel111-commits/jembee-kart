"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (password === "Pintu@1619") {
      router.push("/admin/dashboard");
    } else {
      alert("Wrong Password");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-6 rounded-xl shadow w-80">
        <h2 className="text-xl font-bold mb-4">
          Admin Login
        </h2>

        <input
          type="password"
          placeholder="Enter Admin Password"
          className="border p-2 w-full mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-yellow-400 w-full py-2 rounded font-semibold"
        >
          Login
        </button>
      </div>
    </div>
  );
}

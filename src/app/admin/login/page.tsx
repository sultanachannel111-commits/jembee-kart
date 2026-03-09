"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setAdminCookie } from "@/lib/cookieAuth";

export default function AdminLogin() {

  const router = useRouter();

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const ADMIN_USER = "admin";
  const ADMIN_PASS = "admin123";

  const login = (e: any) => {

    e.preventDefault();

    if (user === ADMIN_USER && pass === ADMIN_PASS) {

      setAdminCookie();

      router.push("/admin");

    }

    else {

      setError("Wrong ID or Password");

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow w-96">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Admin Login
        </h1>

        <form onSubmit={login} className="space-y-4">

          <input
            type="text"
            placeholder="Admin ID"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <input
            type="password"
            placeholder="Password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="w-full border p-2 rounded"
          />

          {error && (
            <p className="text-red-500 text-sm">
              {error}
            </p>
          )}

          <button className="w-full bg-black text-white py-2 rounded">
            Login
          </button>

        </form>

      </div>

    </div>

  );

}

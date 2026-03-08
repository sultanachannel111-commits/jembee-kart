"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function SellerLogin() {

const router = useRouter();

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [loading,setLoading] = useState(false);

const handleLogin = async () => {

setLoading(true);

try {

await signInWithEmailAndPassword(
auth,
email,
password
);

router.push("/seller/dashboard");

} catch (err) {

alert("Login failed. Check email/password");

}

setLoading(false);

};

return (

<div className="flex items-center justify-center h-screen bg-gray-100">

<div className="bg-white p-8 rounded-xl shadow w-80 space-y-4">

<h2 className="text-xl font-bold text-center">
Seller Login
</h2>

<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="border p-2 w-full rounded"
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="border p-2 w-full rounded"
/>

<button
onClick={handleLogin}
className="bg-black text-white w-full p-2 rounded"
>

{loading ? "Logging in..." : "Login"}

</button>

</div>

</div>

);

}

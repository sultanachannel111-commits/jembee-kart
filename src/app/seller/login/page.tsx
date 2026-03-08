"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SellerLogin(){

const router = useRouter();

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [loading,setLoading] = useState(false);

const login = async(e:any)=>{

e.preventDefault();

setLoading(true);

try{

await signInWithEmailAndPassword(auth,email,password);

router.push("/seller/dashboard");

}catch{

alert("Login failed");

}

setLoading(false);

};

return(

<div className="min-h-screen flex items-center justify-center bg-gray-100">

<div className="bg-white p-8 rounded-xl shadow w-96">

<h1 className="text-2xl font-bold mb-6 text-center">
Seller Login
</h1>

<form onSubmit={login} className="space-y-4">

<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="border w-full p-2 rounded"
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="border w-full p-2 rounded"
/>

<button
type="submit"
className="bg-black text-white w-full p-2 rounded"
>

{loading ? "Logging..." : "Login"}

</button>

</form>

</div>

</div>

);

}

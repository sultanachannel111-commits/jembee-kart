"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {

const router = useRouter();

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [loading,setLoading] = useState(false);
const [error,setError] = useState("");

async function handleLogin(e:any){

e.preventDefault();

try{

setLoading(true);
setError("");

const res = await signInWithEmailAndPassword(auth,email,password);

const user = res.user;

const snap = await getDoc(doc(db,"users",user.uid));

if(!snap.exists()){
router.push("/");
return;
}

const data = snap.data();

if(data.role === "admin"){
router.push("/dashboard");
return;
}

if(data.role === "seller"){
router.push("/seller");
return;
}

router.push("/");

}catch(err){

console.log(err);
setError("Login failed");

}

setLoading(false);

}

return (

<div className="flex items-center justify-center min-h-screen bg-gray-100"><form
onSubmit={handleLogin}
className="bg-white p-6 rounded shadow w-80 space-y-4"
><h2 className="text-xl font-bold text-center">
Login
</h2>{error && (

<p className="text-red-500 text-center text-sm">
{error}
</p>
)}<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="w-full border p-2 rounded"
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="w-full border p-2 rounded"
/>

<button
type="submit"
disabled={loading}
className="w-full bg-pink-500 text-white py-2 rounded"

{loading ? "Logging in..." : "Login"}
</button>

</form></div>);

}

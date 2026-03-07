"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage(){

const router = useRouter();

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [show,setShow] = useState(false);
const [loading,setLoading] = useState(false);
const [error,setError] = useState("");

const handleLogin = async(e:any)=>{

e.preventDefault();

setLoading(true);
setError("");

try{

await signInWithEmailAndPassword(auth,email,password);

router.push("/");

}catch(err){

setError("Invalid email or password");

}

setLoading(false);

};

return(

<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600 p-4">

<div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

<h1 className="text-3xl font-bold text-center mb-6">
Login
</h1>

<form onSubmit={handleLogin} className="space-y-4">

<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="w-full border rounded-lg px-4 py-3"
/>

<div className="relative">

<input
type={show ? "text" : "password"}
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="w-full border rounded-lg px-4 py-3"
/>

<button
type="button"
onClick={()=>setShow(!show)}
className="absolute right-3 top-3 text-gray-500"
>

{show ? <EyeOff size={20}/> : <Eye size={20}/>}

</button>

</div>

{error && (
<p className="text-red-500 text-sm">
{error}
</p>
)}

<button
type="submit"
className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold"
>

{loading ? "Logging in..." : "Login"}

</button>

</form>

</div>

</div>

);

}

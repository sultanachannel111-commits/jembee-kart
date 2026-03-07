"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
signInWithEmailAndPassword,
GoogleAuthProvider,
signInWithPopup
} from "firebase/auth";

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

const googleLogin = async()=>{

try{

const provider = new GoogleAuthProvider();

await signInWithPopup(auth,provider);

router.push("/");

}catch(err){

setError("Google login failed");

}

};

return(

<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600 p-4">

<div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

<h1 className="text-3xl font-bold text-center text-pink-600 mb-1">
JembeeKart
</h1>

<p className="text-center text-gray-500 mb-6">
Welcome back! Login to continue
</p>

<form onSubmit={handleLogin} className="space-y-4">

<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
/>

<div className="relative">

<input
type={show ? "text" : "password"}
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
>

{loading ? "Logging in..." : "Login"}

</button>

</form>

<p className="text-center text-sm mt-4 text-gray-500 cursor-pointer">
Forgot password?
</p>

<div className="flex items-center my-4">

<div className="flex-1 border-t"></div>
<span className="px-3 text-gray-400 text-sm">OR</span>
<div className="flex-1 border-t"></div>

</div>

<button
onClick={googleLogin}
className="w-full border py-3 rounded-lg font-medium hover:bg-gray-100"
>

Continue with Google

</button>

<p className="text-center text-sm mt-6">
New user? 
<span className="text-pink-600 font-semibold cursor-pointer">
 Create account
</span>
</p>

</div>

</div>

);

}

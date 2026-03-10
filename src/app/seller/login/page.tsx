"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";

export default function SellerLoginPage() {

const router = useRouter();

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [show,setShow] = useState(false);
const [loading,setLoading] = useState(false);

const login = async(e:any)=>{
e.preventDefault();
setLoading(true);

try{
await signInWithEmailAndPassword(auth,email,password);

toast.success("Seller login successful");

router.push("/seller/dashboard");

}catch(err:any){

toast.error("Invalid email or password");

}

setLoading(false);
};

return(

<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 p-4">

<div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-sm">

<h1 className="text-3xl font-bold text-center text-pink-600">
JembeeKart
</h1>

<p className="text-center text-gray-500 mb-6">
Seller Login
</p>

<form onSubmit={login} className="space-y-4">

<div className="relative">

<Mail className="absolute left-3 top-3 text-gray-400" size={18}/>

<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="w-full border rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none"
/>

</div>

<div className="relative">

<Lock className="absolute left-3 top-3 text-gray-400" size={18}/>

<input
type={show ? "text" : "password"}
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="w-full border rounded-xl pl-10 pr-10 py-3 focus:ring-2 focus:ring-pink-500 outline-none"
/>

<button
type="button"
onClick={()=>setShow(!show)}
className="absolute right-3 top-3 text-gray-400"
>

{show ? <EyeOff size={18}/> : <Eye size={18}/>}

</button>

</div>

<button
type="submit"
className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-semibold shadow"
>

{loading ? "Logging in..." : "Login"}

</button>

</form>

<p className="text-center text-sm text-gray-500 mt-5">

New seller?

<button
onClick={()=>router.push("/seller/signup")}
className="text-pink-600 font-semibold ml-1"
>
Create account
</button>

</p>

</div>

</div>

);
}

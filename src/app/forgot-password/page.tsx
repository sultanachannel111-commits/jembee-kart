"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Mail } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPassword(){

const router = useRouter();

const [email,setEmail] = useState("");
const [loading,setLoading] = useState(false);

const resetPassword = async(e:any)=>{

e.preventDefault();

setLoading(true);

try{

await sendPasswordResetEmail(auth,email);

toast.success("Password reset email sent");

router.push("/login");

}catch{

toast.error("Email not found");

}

setLoading(false);

};

return(

<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 p-4">

<div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md">

<h1 className="text-3xl font-bold text-center text-pink-600">
Forgot Password
</h1>

<p className="text-center text-gray-500 mb-6">
Enter your email to reset password
</p>

<form onSubmit={resetPassword} className="space-y-4">

<div className="relative">

<Mail className="absolute left-3 top-3 text-gray-400" size={18}/>

<input
type="email"
placeholder="Email address"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="w-full border rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none"
/>

</div>

<button
type="submit"
className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-semibold"
>

{loading ? "Sending..." : "Send Reset Link"}

</button>

</form>

<p
onClick={()=>router.push("/login")}
className="text-center text-sm text-pink-600 mt-4 cursor-pointer"
>

Back to login

</p>

</div>

</div>

);

}

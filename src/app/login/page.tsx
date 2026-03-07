"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
signInWithEmailAndPassword,
GoogleAuthProvider,
signInWithPopup
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage(){

const router = useRouter();

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [show,setShow] = useState(false);
const [loading,setLoading] = useState(false);

const login = async(e:any)=>{
e.preventDefault();

setLoading(true);

try{

const userCred = await signInWithEmailAndPassword(auth,email,password);

const uid = userCred.user.uid;

const userDoc = await getDoc(doc(db,"users",uid));

const role = userDoc.data()?.role;

toast.success("Login successful");

if(role === "admin"){
router.push("/admin");
}
else if(role === "seller"){
router.push("/seller");
}
else{
router.push("/");
}

}catch{

toast.error("Invalid email or password");

}

setLoading(false);
};

const googleLogin = async()=>{

try{

const provider = new GoogleAuthProvider();

await signInWithPopup(auth,provider);

toast.success("Logged in with Google");

router.push("/");

}catch{

toast.error("Google login failed");

}

};

return(

<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 via-pink-400 to-purple-600 p-4">

<div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 w-full max-w-sm">

<h1 className="text-3xl font-bold text-center text-pink-600">
JembeeKart
</h1>

<p className="text-center text-gray-500 mt-1 mb-6">
Login
</p>

<form onSubmit={login} className="space-y-4">

<div className="relative">

<Mail className="absolute left-3 top-3 text-gray-400" size={18}/>

<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="w-full border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
/>

</div>

<div className="relative">

<Lock className="absolute left-3 top-3 text-gray-400" size={18}/>

<input
type={show ? "text" : "password"}
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="w-full border rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
/>

<button
type="button"
onClick={()=>setShow(!show)}
className="absolute right-3 top-3 text-gray-500"
>

{show ? <EyeOff size={20}/> : <Eye size={20}/>}

</button>

</div>

<button
type="submit"
className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-md hover:opacity-90 transition"
>

{loading ? "Logging in..." : "Login"}

</button>

</form>

<p className="text-center text-sm text-gray-500 mt-4 cursor-pointer">
Forgot password?
</p>

<div className="flex items-center my-4">

<div className="flex-1 border-t"></div>

<span className="px-3 text-gray-400 text-sm">
OR
</span>

<div className="flex-1 border-t"></div>

</div>

<button
onClick={googleLogin}
className="w-full border py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100"
>

<img
src="https://www.svgrepo.com/show/475656/google-color.svg"
className="w-5 h-5"
/>

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

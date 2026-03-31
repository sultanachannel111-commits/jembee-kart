"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Eye, EyeOff, Mail, Lock, User, Store } from "lucide-react";
import toast from "react-hot-toast";

export default function SellerSignupPage(){

const router = useRouter();

const [name,setName] = useState("");
const [shop,setShop] = useState("");
const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [show,setShow] = useState(false);
const [loading,setLoading] = useState(false);

const signup = async(e:any)=>{

e.preventDefault();
setLoading(true);

try{

let userCred;

// 🔥 TRY CREATE
try{
  userCred = await createUserWithEmailAndPassword(auth,email,password);
}catch(err:any){

  // ⚡ अगर email already है → login कर
  if(err.code === "auth/email-already-in-use"){
    toast("Account already exists, logging in...");
    userCred = await signInWithEmailAndPassword(auth,email,password);
  }else{
    throw err;
  }
}

// 🔥 FIRESTORE FORCE SAVE (IMPORTANT FIX)
await setDoc(doc(db,"users",userCred.user.uid),{
  name,
  shopName:shop,
  email,
  role:"seller",
  createdAt:serverTimestamp()
},{ merge:true });

toast.success("Seller ready ✅");

// 🚀 redirect
router.push("/seller/dashboard");

}catch(err:any){

toast.error(err.message);

}

setLoading(false);
};

return(

<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">

<div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md">

<h1 className="text-3xl font-bold text-center text-purple-600">
JembeeKart
</h1>

<p className="text-center text-gray-500 mb-6">
Seller Signup
</p>

<form onSubmit={signup} className="space-y-4">

<div className="relative">
<User className="absolute left-3 top-3 text-gray-400" size={18}/>
<input
type="text"
placeholder="Full Name"
value={name}
onChange={(e)=>setName(e.target.value)}
className="w-full border rounded-xl pl-10 py-3"
/>
</div>

<div className="relative">
<Store className="absolute left-3 top-3 text-gray-400" size={18}/>
<input
type="text"
placeholder="Shop Name"
value={shop}
onChange={(e)=>setShop(e.target.value)}
className="w-full border rounded-xl pl-10 py-3"
/>
</div>

<div className="relative">
<Mail className="absolute left-3 top-3 text-gray-400" size={18}/>
<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="w-full border rounded-xl pl-10 py-3"
/>
</div>

<div className="relative">
<Lock className="absolute left-3 top-3 text-gray-400" size={18}/>
<input
type={show ? "text" : "password"}
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="w-full border rounded-xl pl-10 pr-10 py-3"
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
className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl"
>
{loading ? "Creating..." : "Create account"}
</button>

</form>

<p className="text-center text-sm mt-5">
Already seller?
<button
onClick={()=>router.push("/seller/login")}
className="text-purple-600 ml-1"
>
Login
</button>
</p>

</div>

</div>

);
}

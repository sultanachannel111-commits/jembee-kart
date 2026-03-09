"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SellerSignup(){

const router = useRouter();

const [name,setName] = useState("");
const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [loading,setLoading] = useState(false);

const signup = async (e:any)=>{

e.preventDefault();
setLoading(true);

try{

const res = await createUserWithEmailAndPassword(auth,email,password);
const user = res.user;

await setDoc(doc(db,"users",user.uid),{
uid:user.uid,
name,
email,
role:"seller",
createdAt:serverTimestamp()
});

alert("Seller account created");

router.push("/seller/login");

}catch(err){
alert("Signup failed");
}

setLoading(false);

};

return(

<div className="min-h-screen flex items-center justify-center bg-gray-100">

<div className="bg-white p-8 rounded-xl shadow w-96">

<h1 className="text-2xl font-bold text-center mb-6">
Seller Signup
</h1>

<form onSubmit={signup} className="space-y-4">

<input
placeholder="Full Name"
value={name}
onChange={(e)=>setName(e.target.value)}
className="border w-full p-2 rounded"
/>

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

{loading ? "Creating..." : "Create Seller Account"}

</button>

</form>

<p className="text-center text-sm mt-4">

Already have account?

<a href="/seller/login" className="text-blue-600 ml-1">
Login
</a>

</p>

</div>

</div>

);

}

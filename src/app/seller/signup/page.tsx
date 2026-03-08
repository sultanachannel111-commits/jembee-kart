"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SellerSignup(){

const router = useRouter();

const [name,setName] = useState("");
const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [loading,setLoading] = useState(false);

const signup = async(e:any)=>{

e.preventDefault();

setLoading(true);

try{

const res = await createUserWithEmailAndPassword(
auth,
email,
password
);

const user = res.user;

await setDoc(
doc(db,"users",user.uid),
{
name:name,
email:email,
role:"seller",
createdAt:serverTimestamp()
}
);

alert("Seller account created");

router.push("/seller/dashboard");

}catch(err){

console.log(err);
alert("Signup failed");

}

setLoading(false);

};

return(

<div className="min-h-screen flex items-center justify-center bg-gray-100">

<div className="bg-white p-8 rounded-xl shadow w-96">

<h1 className="text-2xl font-bold mb-6 text-center">
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

</div>

</div>

);

}

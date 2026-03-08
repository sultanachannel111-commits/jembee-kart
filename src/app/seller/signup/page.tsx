"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth,db } from "@/lib/firebase";
import { doc,setDoc } from "firebase/firestore";

export default function SellerSignup(){

const router = useRouter();

const [shopName,setShopName] = useState("");
const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const signup = async(e:any)=>{

e.preventDefault();

const user = await createUserWithEmailAndPassword(auth,email,password);

await setDoc(
doc(db,"users",user.user.uid),
{
role:"seller",
shopName,
email
}
);

router.push("/seller/dashboard");

};

return(

<div className="min-h-screen flex items-center justify-center bg-gray-100">

<div className="bg-white p-8 rounded-xl shadow w-96">

<h1 className="text-2xl font-bold mb-6 text-center">
Seller Signup
</h1>

<form onSubmit={signup} className="space-y-4">

<input
placeholder="Shop Name"
value={shopName}
onChange={(e)=>setShopName(e.target.value)}
className="border w-full p-2 rounded"
/>

<input
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
className="bg-black text-white w-full p-2 rounded"
>
Signup
</button>

</form>

</div>

</div>

);

}

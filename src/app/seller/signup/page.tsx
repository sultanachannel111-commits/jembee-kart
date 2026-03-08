"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function SellerSignup(){

const router = useRouter();

const [name,setName] = useState("");
const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const handleSignup = async()=>{

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
createdAt:Date.now()
}
);

router.push("/seller/dashboard");

}catch(err){

alert("Signup Error");

}

};

return(

<div className="flex items-center justify-center h-screen">

<div className="bg-white p-8 shadow-lg w-80 space-y-4">

<h2 className="text-xl font-bold text-center">
Seller Signup
</h2>

<input
className="border p-2 w-full"
placeholder="Name"
value={name}
onChange={(e)=>setName(e.target.value)}
/>

<input
className="border p-2 w-full"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>

<input
type="password"
className="border p-2 w-full"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
/>

<button
onClick={handleSignup}
className="bg-black text-white w-full p-2"
>
Create Seller Account
</button>

</div>

</div>

);

}

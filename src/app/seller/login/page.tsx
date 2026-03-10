"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";

export default function SellerLoginPage() {

const router = useRouter();

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const login = async (e:any)=>{
e.preventDefault();

try{
await signInWithEmailAndPassword(auth,email,password);
toast.success("Login successful");
router.push("/seller/dashboard");
}catch{
toast.error("Login failed");
}
};

return(

<div className="p-10">

<h1>Seller Login</h1>

<form onSubmit={login}>

<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
/>

<button type="submit">
Login
</button>

</form>

<p>

New Seller ?

<button onClick={()=>router.push("/seller/signup")}>
Create account
</button>

</p>

</div>

);

}

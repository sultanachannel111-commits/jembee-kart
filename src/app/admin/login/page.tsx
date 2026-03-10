"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin(){

const router = useRouter();

const [user,setUser] = useState("");
const [pass,setPass] = useState("");
const [error,setError] = useState("");

const login = async (e:any)=>{

e.preventDefault();

const res = await fetch("/api/admin-login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({user,pass})
});

if(res.ok){

router.push("/admin");

}else{

setError("Wrong ID or Password");

}

};

return(

<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">

<div className="bg-white p-8 rounded-2xl shadow-xl w-96">

<h1 className="text-2xl font-bold mb-6 text-center">
Admin Login
</h1>

<form onSubmit={login} className="space-y-4">

<input
type="text"
placeholder="Admin ID"
value={user}
onChange={(e)=>setUser(e.target.value)}
className="w-full border p-3 rounded"
/>

<input
type="password"
placeholder="Password"
value={pass}
onChange={(e)=>setPass(e.target.value)}
className="w-full border p-3 rounded"
/>

{error && (
<p className="text-red-500 text-sm">
{error}
</p>
)}

<button className="w-full bg-black text-white py-3 rounded-lg">
Login
</button>

</form>

</div>

</div>

);
}

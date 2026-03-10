"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {

const router = useRouter();

const [user,setUser] = useState("");
const [pass,setPass] = useState("");
const [error,setError] = useState("");

/* Admin credentials */
const ADMIN_USER = "jembeeadmin";
const ADMIN_PASS = "jembee@123";

const login = (e:any)=>{

e.preventDefault();

/* check credentials */

if(user === ADMIN_USER && pass === ADMIN_PASS){

/* set cookie for middleware */

document.cookie = "admin=true; path=/";

/* redirect to dashboard */

router.push("/admin");

}else{

setError("Wrong ID or Password");

}

};

return(

<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 p-4">

<div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-sm">

<h1 className="text-3xl font-bold text-center text-gray-800">
Admin Login
</h1>

<p className="text-center text-gray-500 mt-1 mb-6">
JembeeKart Admin Panel
</p>

<form onSubmit={login} className="space-y-4">

<input
type="text"
placeholder="Admin ID"
value={user}
onChange={(e)=>setUser(e.target.value)}
className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
/>

<input
type="password"
placeholder="Password"
value={pass}
onChange={(e)=>setPass(e.target.value)}
className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
/>

{error && (

<p className="text-red-500 text-sm text-center">
{error}
</p>

)}

<button
type="submit"
className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:opacity-90"
>
Login
</button>

</form>

</div>

</div>

);

}

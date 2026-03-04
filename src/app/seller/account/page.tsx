"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Account(){

const [user,setUser] = useState<any>(null)

useEffect(()=>{

async function loadUser(){

const current = auth.currentUser

if(!current) return

const snap = await getDoc(doc(db,"users",current.uid))

if(snap.exists()){
setUser(snap.data())
}

}

loadUser()

},[])

return(

<div>

<h1 className="text-2xl font-bold mb-6">
Seller Account
</h1>

{!user && <p>Loading account...</p>}

{user && (

<div className="bg-white p-6 rounded shadow max-w-lg">

<p><b>Name:</b> {user.name}</p>

<p><b>Email:</b> {auth.currentUser?.email}</p>

<p><b>Role:</b> {user.role}</p>

</div>

)}

</div>

)

}

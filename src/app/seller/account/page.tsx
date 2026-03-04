"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Account(){

const [user,setUser] = useState<any>(null)
const [loading,setLoading] = useState(true)

useEffect(()=>{

const unsubscribe = onAuthStateChanged(auth, async (currentUser)=>{

if(!currentUser){
setLoading(false)
return
}

try{

const snap = await getDoc(doc(db,"users",currentUser.uid))

if(snap.exists()){
setUser(snap.data())
}

}catch(err){
console.log(err)
}

setLoading(false)

})

return ()=> unsubscribe()

},[])

if(loading){
return <p className="p-6">Loading account...</p>
}

return(

<div>

<h1 className="text-2xl font-bold mb-6">
Seller Account
</h1>

{!user && (
<p>No account data found</p>
)}

{user && (

<div className="bg-white p-6 rounded shadow max-w-lg">

<p className="mb-3">
<b>Name:</b> {user.name || "Not set"}
</p>

<p className="mb-3">
<b>Email:</b> {auth.currentUser?.email}
</p>

<p className="mb-3">
<b>Role:</b> {user.role}
</p>

</div>

)}

</div>

)

}

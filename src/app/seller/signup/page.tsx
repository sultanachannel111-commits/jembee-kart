"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export default function SellerSignup(){

const router = useRouter()

const [name,setName] = useState("")
const [email,setEmail] = useState("")
const [password,setPassword] = useState("")
const [loading,setLoading] = useState(false)

async function handleSignup(){

if(!name || !email || !password){
alert("Fill all fields")
return
}

setLoading(true)

try{

// Firebase Auth user create
const res = await createUserWithEmailAndPassword(
auth,
email,
password
)

const uid = res.user.uid

// Firestore user create
await setDoc(doc(db,"users",uid),{

name:name,
email:email,
role:"seller",
createdAt:serverTimestamp()

})

alert("Seller account created")

router.push("/seller/dashboard")

}catch(err){

console.log(err)
alert("Signup failed")

}

setLoading(false)

}

return(

<div className="flex items-center justify-center h-screen">

<div className="bg-white p-6 shadow-lg w-80 space-y-4">

<h2 className="text-xl font-bold">
Seller Signup
</h2>

<input
placeholder="Name"
value={name}
onChange={(e)=>setName(e.target.value)}
className="border p-2 w-full"
/>

<input
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="border p-2 w-full"
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="border p-2 w-full"
/>

<button
onClick={handleSignup}
className="bg-black text-white w-full p-2"
>

{loading ? "Creating..." : "Create Seller Account"}

</button>

</div>

</div>

)

}

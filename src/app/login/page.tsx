"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";

import {
signInWithEmailAndPassword,
createUserWithEmailAndPassword,
signInWithPopup,
GoogleAuthProvider,
sendPasswordResetEmail
} from "firebase/auth";

import { doc, getDoc, setDoc } from "firebase/firestore";

export default function LoginPage(){

const router = useRouter()

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")
const [show,setShow] = useState(false)
const [mode,setMode] = useState("login")
const [role,setRole] = useState("customer")

const handleLogin = async()=>{

const res = await signInWithEmailAndPassword(auth,email,password)

const snap = await getDoc(doc(db,"users",res.user.uid))

if(snap.exists()){

const data:any = snap.data()

if(data.role==="seller"){
router.replace("/seller")
return
}

}

router.replace("/")

}

const handleRegister = async()=>{

const res = await createUserWithEmailAndPassword(auth,email,password)

await setDoc(doc(db,"users",res.user.uid),{
email,
role
})

if(role==="seller"){
router.replace("/seller")
}else{
router.replace("/")
}

}

const googleLogin = async()=>{

const provider = new GoogleAuthProvider()

const res = await signInWithPopup(auth,provider)

const snap = await getDoc(doc(db,"users",res.user.uid))

if(!snap.exists()){

await setDoc(doc(db,"users",res.user.uid),{
email:res.user.email,
role:"customer"
})

}

router.replace("/")

}

const forgotPassword = async()=>{

await sendPasswordResetEmail(auth,email)

alert("Reset link sent")

}

return(

<div className="min-h-screen flex items-center justify-center bg-gray-100">

<div className="bg-white p-8 rounded-xl shadow-xl w-96 space-y-4">

<h2 className="text-2xl font-bold text-center">
JembeeKart Login
</h2>

<div className="flex gap-2">

<button
onClick={()=>setRole("customer")}
className={`flex-1 py-2 rounded ${role==="customer"?"bg-yellow-400":"bg-gray-200"}`}
>
Customer
</button>

<button
onClick={()=>setRole("seller")}
className={`flex-1 py-2 rounded ${role==="seller"?"bg-yellow-400":"bg-gray-200"}`}
>
Seller
</button>

</div>

<input
type="email"
placeholder="Email"
className="w-full border p-2 rounded"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>

<div className="flex border rounded">

<input
type={show?"text":"password"}
placeholder="Password"
className="flex-1 p-2 outline-none"
value={password}
onChange={(e)=>setPassword(e.target.value)}
/>

<button onClick={()=>setShow(!show)} className="px-3">
{show?"Hide":"Show"}
</button>

</div>

{mode==="login" ? (

<button
onClick={handleLogin}
className="w-full bg-black text-white py-2 rounded"
>
Login
</button>

):( 

<button
onClick={handleRegister}
className="w-full bg-black text-white py-2 rounded"
>
Register
</button>

)}

<button
onClick={googleLogin}
className="w-full bg-red-500 text-white py-2 rounded"
>
Login with Google
</button>

<button
onClick={forgotPassword}
className="text-red-500 text-sm"
>
Forgot Password
</button>

<p className="text-center text-sm">

{mode==="login"?"No account?":"Already have account?"}

<span
onClick={()=>setMode(mode==="login"?"register":"login")}
className="text-blue-500 cursor-pointer ml-1"
>

{mode==="login"?"Register":"Login"}

</span>

</p>

</div>

</div>

)

}

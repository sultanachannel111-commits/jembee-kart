"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function SellerLayout({
children,
}:{
children:React.ReactNode
}){

const router = useRouter()
const [loading,setLoading] = useState(true)

useEffect(()=>{

const unsub = onAuthStateChanged(auth, async(user)=>{

if(!user){
router.replace("/login")
return
}

try{

const snap = await getDoc(doc(db,"users",user.uid))

if(!snap.exists()){
router.replace("/")
return
}

const data = snap.data()

if(data.role !== "seller"){
router.replace("/")
return
}

setLoading(false)

}catch(err){
console.log(err)
router.replace("/")
}

})

return ()=> unsub()

},[])

if(loading){
return <div className="p-10">Checking seller access...</div>
}

return <>{children}</>

}

"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function SellerLayout({ children }: any){

const router = useRouter();
const pathname = usePathname();

const [loading,setLoading] = useState(true);
const [allowed,setAllowed] = useState(false);

// ✅ login & signup page check
const isPublicPage =
pathname.startsWith("/seller/login") ||
pathname.startsWith("/seller/signup");

useEffect(()=>{

// public page par auth check hi mat karo
if(isPublicPage){
setLoading(false);
return;
}

const unsub = onAuthStateChanged(auth, async (user)=>{

try{

if(!user){
router.replace("/seller/login");
setLoading(false);
return;
}

const snap = await getDoc(doc(db,"users",user.uid));

if(!snap.exists()){
router.replace("/");
setLoading(false);
return;
}

const data:any = snap.data();

if(data?.role !== "seller"){
router.replace("/");
setLoading(false);
return;
}

setAllowed(true);
setLoading(false);

}catch(err){

console.log(err);
setLoading(false);

}

});

return ()=>unsub();

},[pathname]);

// login/signup page
if(isPublicPage){
return <>{children}</>;
}

// loading
if(loading){
return(
<div className="flex items-center justify-center h-screen">
Loading...
</div>
)
}

if(!allowed){
return null;
}

const logout = async()=>{
await signOut(auth);
router.push("/seller/login");
};

return(

<div className="flex min-h-screen">

{/* SIDEBAR */}

<div className="w-64 bg-white shadow p-5">

<h2 className="text-xl font-bold mb-6">
Seller Panel
</h2>

<Link href="/seller/dashboard">Dashboard</Link>

<br/>

<Link href="/seller/products">Products</Link>

<br/>

<Link href="/seller/orders">Orders</Link>

<br/>

<button
onClick={logout}
className="text-red-500 mt-6"
>
Logout
</button>

</div>

{/* MAIN */}

<div className="flex-1 p-6">
{children}
</div>

</div>

)

}

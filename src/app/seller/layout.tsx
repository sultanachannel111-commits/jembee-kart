"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SellerLayout({children}:{children:React.ReactNode}){

const {role,loading} = useAuth()

const router = useRouter()

useEffect(()=>{

if(!loading && role!=="seller"){
router.replace("/")
}

},[role,loading])

if(loading){

return <div className="p-10">Loading seller panel...</div>

}

return(

<div className="flex min-h-screen">

<div className="w-64 bg-black text-white p-6 space-y-4">

<h2 className="text-xl font-bold text-pink-500">
Seller Panel
</h2>

<a href="/seller">Dashboard</a>
<a href="/seller/products">Products</a>
<a href="/seller/orders">Orders</a>
<a href="/seller/revenue">Revenue</a>

</div>

<div className="flex-1 p-6">

{children}

</div>

</div>

)

}

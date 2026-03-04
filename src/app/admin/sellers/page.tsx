"use client";

import { useEffect,useState } from "react";
import { collection,getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function SellersPage(){

const [sellers,setSellers]=useState([]);

useEffect(()=>{
loadSellers();
},[]);

async function loadSellers(){

const snap = await getDocs(collection(db,"users"));

const list=[];

snap.forEach((doc)=>{

const data=doc.data();

if(data.role==="seller"){
list.push(data);
}

});

setSellers(list);

}

return(

<div className="p-6">

<h1 className="text-3xl font-bold mb-6">
All Sellers
</h1>

<div className="space-y-3">

{sellers.map((s,i)=>(

<div key={i} className="border p-4 rounded">

<div>
{s.name}
</div>

<div className="text-sm text-gray-500">
{s.email}
</div>

<Link
href={`/admin/sellers/${s.email}`}
className="text-blue-600"
>
View Seller Panel
</Link>

</div>

))}

</div>

</div>

);

}

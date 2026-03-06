"use client";

import { useEffect,useState } from "react";
import { collection,getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function SellersPage(){

const [sellers,setSellers]=useState<any[]>([]);

useEffect(()=>{
loadSellers();
},[]);

async function loadSellers(){

const snap = await getDocs(
collection(db,"users")
);

const list:any[]=[];

snap.forEach((doc)=>{

const data=doc.data();

if(data.role==="seller"){

list.push({
id:doc.id,
...data
});

}

});

setSellers(list);

}

return(

<div className="p-6">

{/* HEADER */}

<div className="mb-8">

<h1 className="text-3xl font-bold text-purple-600">
Seller Management
</h1>

<p className="text-gray-500 text-sm">
View and manage all platform sellers
</p>

</div>


{/* SELLERS GRID */}

<div className="grid md:grid-cols-2 gap-6">

{sellers.map((s)=>(

<div
key={s.id}
className="bg-white shadow rounded-xl p-5 space-y-3"
>

{/* NAME */}

<div>

<p className="text-sm text-gray-500">
Seller Name
</p>

<p className="font-semibold">
{s.name || "Unknown Seller"}
</p>

</div>


{/* EMAIL */}

<div>

<p className="text-sm text-gray-500">
Email
</p>

<p>
{s.email}
</p>

</div>


{/* STATUS */}

<div>

<span
className={`text-xs px-3 py-1 rounded ${
s.active
? "bg-green-100 text-green-700"
: "bg-red-100 text-red-700"
}`}
>
{s.active ? "Active" : "Inactive"}
</span>

</div>


{/* ACTION */}

<Link
href={`/admin/sellers/${s.id}`}
className="inline-block bg-purple-600 text-white px-4 py-2 rounded"
>

View Seller Panel

</Link>

</div>

))}

</div>

</div>

);

}

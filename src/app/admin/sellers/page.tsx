"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SellersPage() {

const [sellers,setSellers]=useState<any[]>([]);
const [loading,setLoading]=useState(false);

useEffect(()=>{
loadSellers();
},[]);

async function loadSellers(){

const snap = await getDocs(collection(db,"users"));

const list = snap.docs
.map(d=>({
id:d.id,
...d.data()
}))
.filter((u:any)=>u.role==="seller");

setSellers(list);

}

async function toggleSeller(id:string,active:boolean){

setLoading(true);

await updateDoc(doc(db,"users",id),{
active:!active
});

await loadSellers();

setLoading(false);

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

{sellers.length===0 && (

<p className="text-gray-500">
No sellers found
</p>

)}

<div className="grid md:grid-cols-2 gap-6">

{sellers.map((s)=>(

<div
key={s.id}
className="bg-white shadow rounded-xl p-5 space-y-4"
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

{s.active ? "Active" : "Blocked"}

</span>

</div>


{/* ACTION */}

<button
disabled={loading}
onClick={()=>toggleSeller(s.id,s.active)}
className={`px-4 py-2 rounded text-white ${
s.active
? "bg-red-500"
: "bg-green-600"
}`}
>

{s.active ? "Block Seller" : "Activate Seller"}

</button>

</div>

))}

</div>

</div>

);

}

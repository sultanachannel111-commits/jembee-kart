"use client";

import { useState } from "react";

export default function SellerProfile(){

const [name,setName] = useState("");
const [phone,setPhone] = useState("");

return(

<div>

<h1 className="text-2xl font-bold mb-6">
Seller Profile
</h1>

<input
placeholder="Name"
value={name}
onChange={(e)=>setName(e.target.value)}
className="border p-3 rounded w-full mb-3"
/>

<input
placeholder="Phone"
value={phone}
onChange={(e)=>setPhone(e.target.value)}
className="border p-3 rounded w-full mb-3"
/>

<button className="bg-black text-white px-4 py-2 rounded">
Save Profile
</button>

</div>

)

}

"use client";

import { useState } from "react";

export default function AddProduct(){

const [name,setName] = useState("");
const [price,setPrice] = useState("");

return(

<div className="p-6">

<h1 className="text-2xl font-bold mb-6">
Add Product
</h1>

<input
placeholder="Product Name"
value={name}
onChange={(e)=>setName(e.target.value)}
className="border p-2 w-full mb-3"
/>

<input
placeholder="Price"
value={price}
onChange={(e)=>setPrice(e.target.value)}
className="border p-2 w-full mb-3"
/>

<button className="bg-black text-white px-4 py-2 rounded">
Publish Product
</button>

</div>

);

}

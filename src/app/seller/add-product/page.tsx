"use client";

import { useState } from "react";

export default function AddProduct(){

const [name,setName] = useState("")
const [price,setPrice] = useState("")
const [desc,setDesc] = useState("")

return(

<div className="max-w-xl">

<h1 className="text-2xl font-bold mb-6">
Add Product
</h1>

<input
placeholder="Product Name"
value={name}
onChange={(e)=>setName(e.target.value)}
className="border p-3 w-full mb-3 rounded"
/>

<textarea
placeholder="Description"
value={desc}
onChange={(e)=>setDesc(e.target.value)}
className="border p-3 w-full mb-3 rounded"
/>

<input
placeholder="Price"
value={price}
onChange={(e)=>setPrice(e.target.value)}
className="border p-3 w-full mb-3 rounded"
/>

<button
className="bg-black text-white px-5 py-3 rounded"
>
Publish Product
</button>

</div>

)

}

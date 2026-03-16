"use client";

import { useState,useEffect } from "react";

export default function AddProduct(){

const [name,setName] = useState("");
const [category,setCategory] = useState("");
const [image,setImage] = useState("");

useEffect(()=>{

if(typeof window !== "undefined"){

const params = new URLSearchParams(window.location.search);

const img = params.get("image");

if(img){
setImage(img);
}

}

},[]);

return(

<div className="p-6 max-w-xl">

<h1 className="text-2xl font-bold mb-6">
Add Product
</h1>


{/* PRODUCT NAME */}

<input
placeholder="Product Name"
value={name}
onChange={(e)=>setName(e.target.value)}
className="border p-2 w-full mb-4"
/>


{/* CATEGORY */}

<input
placeholder="Category"
value={category}
onChange={(e)=>setCategory(e.target.value)}
className="border p-2 w-full mb-4"
/>


{/* IMAGE LINK */}

<input
placeholder="Image Link"
value={image}
readOnly
className="border p-2 w-full mb-2"
/>


{/* UPLOAD BUTTON */}

<button
type="button"
onClick={()=>window.location.href="/admin/upload-image"}
className="bg-blue-600 text-white px-4 py-2 rounded w-full mb-6"
>

Upload / Select Image

</button>


<button
className="bg-green-600 text-white px-4 py-2 rounded w-full"
>

Save Product

</button>


</div>

);

}

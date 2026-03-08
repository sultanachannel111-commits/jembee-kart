"use client";

import { useState,useEffect } from "react";
import { db } from "@/lib/firebase";
import {
addDoc,
collection,
serverTimestamp,
getDocs
} from "firebase/firestore";

export default function AdminQikinkProducts(){

const [name,setName] = useState("");
const [qikinkId,setQikinkId] = useState("");
const [image,setImage] = useState("");
const [basePrice,setBasePrice] = useState("");
const [minPrice,setMinPrice] = useState("");
const [category,setCategory] = useState("");
const [categories,setCategories] = useState<any[]>([]);
const [variations,setVariations] = useState("");

/* ======================
LOAD CATEGORIES
====================== */

useEffect(()=>{

loadCategories();

},[]);

const loadCategories = async ()=>{

const snap = await getDocs(
collection(db,"qikinkCategories")
);

setCategories(
snap.docs.map(d=>({
id:d.id,
...d.data()
}))
);

};

/* ======================
SAVE PRODUCT
====================== */

const saveProduct = async ()=>{

if(!name || !qikinkId || !category){

alert("Fill all required fields");
return;

}

await addDoc(
collection(db,"adminProducts"),
{
name,
qikinkId,
category,
image,
basePrice:Number(basePrice),
minPrice:Number(minPrice),
variations:variations.split(","),
createdAt:serverTimestamp()
}
);

setName("");
setQikinkId("");
setImage("");
setBasePrice("");
setMinPrice("");
setVariations("");

alert("Product Added");

};

/* ======================
UI
====================== */

return(

<div className="p-6 max-w-xl">

<h1 className="text-3xl font-bold mb-6">
Add Qikink Product
</h1>

<div className="space-y-4">

<input
value={name}
onChange={(e)=>setName(e.target.value)}
placeholder="Product Name"
className="border w-full p-2 rounded"
/>

<input
value={qikinkId}
onChange={(e)=>setQikinkId(e.target.value)}
placeholder="Qikink Product ID"
className="border w-full p-2 rounded"
/>

<select
value={category}
onChange={(e)=>setCategory(e.target.value)}
className="border w-full p-2 rounded"
>

<option value="">
Select Category
</option>

{categories.map((c:any)=>(
<option key={c.id} value={c.name}>
{c.name}
</option>
))}

</select>

<input
value={image}
onChange={(e)=>setImage(e.target.value)}
placeholder="Image Link"
className="border w-full p-2 rounded"
/>

{image && (

<img
src={image}
className="w-24 h-24 rounded"
/>

)}

<input
value={basePrice}
onChange={(e)=>setBasePrice(e.target.value)}
placeholder="Qikink Base Price"
className="border w-full p-2 rounded"
/>

<input
value={minPrice}
onChange={(e)=>setMinPrice(e.target.value)}
placeholder="Minimum Sell Price"
className="border w-full p-2 rounded"
/>

<input
value={variations}
onChange={(e)=>setVariations(e.target.value)}
placeholder="Variations (S,M,L / Red,Blue)"
className="border w-full p-2 rounded"
/>

<button
onClick={saveProduct}
className="bg-black text-white px-4 py-2 rounded"
>

Add Product

</button>

</div>

</div>

);

}

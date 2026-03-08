"use client";

import { useState, useEffect } from "react";
import { db,auth } from "@/lib/firebase";
import {
collection,
getDocs,
addDoc,
serverTimestamp
} from "firebase/firestore";

export default function SellerAddProduct(){

const [adminProducts,setAdminProducts] = useState<any[]>([])
const [selectedProduct,setSelectedProduct] = useState<any>(null)

const [description,setDescription] = useState("")
const [price,setPrice] = useState("")

useEffect(()=>{

loadAdminProducts()

},[])

const loadAdminProducts = async ()=>{

const snap = await getDocs(
collection(db,"adminProducts")
)

setAdminProducts(
snap.docs.map(d=>({
id:d.id,
...d.data()
}))
)

}

const publishProduct = async ()=>{

if(!selectedProduct){
alert("Select product")
return
}

const user = auth.currentUser

await addDoc(
collection(db,"products"),
{
adminProductId:selectedProduct.id,
name:selectedProduct.name,
image:selectedProduct.image,
category:selectedProduct.category,

sellerId:user?.uid,

description,
price:Number(price),

createdAt:serverTimestamp()
}
)

alert("Product Published")

}

return(

<div className="p-6 max-w-xl">

<h1 className="text-2xl font-bold mb-6">
Add Product
</h1>

<select
onChange={(e)=>{

const p = adminProducts.find(
x=>x.id===e.target.value
)

setSelectedProduct(p)

}}
className="border p-3 w-full mb-3 rounded"
>

<option>Select Admin Product</option>

{adminProducts.map((p:any)=>(
<option key={p.id} value={p.id}>
{p.name}
</option>
))}

</select>

{selectedProduct && (

<div className="mb-4">

<img
src={selectedProduct.image}
className="w-32 rounded"
/>

<p className="text-gray-500 mt-2">
Minimum Price ₹{selectedProduct.minPrice}
</p>

</div>

)}

<textarea
placeholder="Product Description"
value={description}
onChange={(e)=>setDescription(e.target.value)}
className="border p-3 w-full mb-3 rounded"
/>

<input
placeholder="Your Sell Price"
value={price}
onChange={(e)=>setPrice(e.target.value)}
className="border p-3 w-full mb-3 rounded"
/>

<button
onClick={publishProduct}
className="bg-black text-white px-5 py-3 rounded"
>

Publish Product

</button>

</div>

)

}

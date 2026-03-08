"use client"

import { useState, useEffect } from "react"
import { db, auth } from "@/lib/firebase"
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore"

export default function SellerAddProduct(){

const [adminProducts,setAdminProducts] = useState<any[]>([])
const [selectedProduct,setSelectedProduct] = useState<any>(null)
const [description,setDescription] = useState("")
const [price,setPrice] = useState("")
const [loading,setLoading] = useState(false)

useEffect(() => {
loadProducts()
}, [])

async function loadProducts(){

try{

const snap = await getDocs(collection(db,"adminProducts"))

const data = snap.docs.map(doc => ({
id: doc.id,
...doc.data()
}))

setAdminProducts(data)

}catch(err){
console.log(err)
}

}

async function publishProduct(){

if(!selectedProduct){
alert("Select product first")
return
}

const user = auth.currentUser

if(!user){
alert("Login required")
return
}

setLoading(true)

try{

await addDoc(collection(db,"products"),{
adminProductId:selectedProduct.id,
name:selectedProduct.name,
image:selectedProduct.image,
category:selectedProduct.category,
sellerId:user.uid,
description,
price:Number(price),
createdAt:serverTimestamp()
})

alert("Product Published")

setPrice("")
setDescription("")
setSelectedProduct(null)

}catch(err){

console.log(err)
alert("Publish failed")

}

setLoading(false)

}

return(

<div className="p-6 max-w-xl">

<h1 className="text-2xl font-bold mb-6">
Add Product
</h1>

<select
className="border p-3 w-full mb-4 rounded"
onChange={(e)=>{

const p = adminProducts.find(x=>x.id===e.target.value)
setSelectedProduct(p)

}}
>

<option value="">Select Admin Product</option>

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
className="border

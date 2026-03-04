"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function Products(){

const [products,setProducts] = useState<any[]>([])
const [loading,setLoading] = useState(true)

useEffect(()=>{

async function loadProducts(){

try{

const user = auth.currentUser

if(!user){
setLoading(false)
return
}

const q = query(
collection(db,"products"),
where("sellerId","==",user.uid)
)

const snap = await getDocs(q)

const list = snap.docs.map(d=>({
id:d.id,
...d.data()
}))

setProducts(list)

}catch(err){

console.log(err)

}

setLoading(false)

}

loadProducts()

},[])

if(loading){
return <p className="text-gray-500">Loading products...</p>
}

return(

<div><h1 className="text-2xl font-bold mb-6">
My Products
</h1>{products.length===0 && (

<p>No products added yet</p>
)}<div className="grid md:grid-cols-3 gap-6">{products.map((p:any)=>(

<div key={p.id} className="bg-white shadow rounded p-4"><img
src={p.image}
className="w-full h-40 object-cover rounded"
/>

<h3 className="font-bold mt-2">
{p.title}
</h3><p className="text-pink-600 font-semibold">
₹{p.price}
</p></div>))}

</div></div>)

}

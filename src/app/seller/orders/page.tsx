"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
collection,
getDocs,
query,
where,
deleteDoc,
doc
} from "firebase/firestore";

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

async function deleteProduct(id:string){

try{

await deleteDoc(doc(db,"products",id))

setProducts(products.filter(p=>p.id!==id))

}catch(err){

console.log(err)

}

}

if(loading){
return(

<div className="p-10 text-center text-gray-500">
Loading products...
</div>)
}

return(

<div><h1 className="text-2xl font-bold mb-6">
My Products
</h1>{products.length===0 && (

<div className="bg-white p-6 rounded shadow text-gray-500">
No products added yet
</div>)}

<div className="grid md:grid-cols-3 gap-6">{products.map((p:any)=>(

<div
key={p.id}
className="bg-white shadow rounded-lg overflow-hidden hover:shadow-xl transition"
><img
src={p.image}
className="w-full h-44 object-cover"
/>

<div className="p-4"><h3 className="font-bold text-lg">
{p.title}
</h3><p className="text-pink-600 font-semibold mt-1">
₹{p.price}
</p><div className="flex gap-3 mt-4"><button className="bg-blue-500 text-white px-4 py-1 rounded">
Edit
</button><button
onClick={()=>deleteProduct(p.id)}
className="bg-red-500 text-white px-4 py-1 rounded"

«»

Delete
</button>

</div></div></div>))}

</div></div>)

}

"use client";

import { useEffect,useState } from "react";
import { db,auth } from "@/lib/firebase";
import { collection,getDocs,query,where } from "firebase/firestore";

export default function Products(){

const [products,setProducts] = useState<any[]>([])

useEffect(()=>{

load()

},[])

const load = async ()=>{

const user = auth.currentUser

const q = query(
collection(db,"products"),
where("sellerId","==",user?.uid)
)

const snap = await getDocs(q)

setProducts(
snap.docs.map(d=>({
id:d.id,
...d.data()
}))
)

}

return(

<div>

<h1 className="text-2xl font-bold mb-6">
My Products
</h1>

<div className="grid md:grid-cols-3 gap-4">

{products.map((p:any)=>(

<div
key={p.id}
className="bg-white shadow p-4 rounded"
>

<img
src={p.image}
className="w-full h-40 object-cover rounded"
/>

<h3 className="font-bold mt-2">
{p.name}
</h3>

<p className="text-pink-600 font-semibold">
₹{p.price}
</p>

</div>

))}

</div>

</div>

)

}

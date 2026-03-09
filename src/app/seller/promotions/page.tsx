"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import {
collection,
addDoc,
serverTimestamp,
query,
where,
getDocs
} from "firebase/firestore";

export default function SellerPromotions(){

const [products,setProducts] = useState<any[]>([]);
const [product,setProduct] = useState("");
const [discount,setDiscount] = useState("");
const [loading,setLoading] = useState(false);

useEffect(()=>{

loadProducts();

},[]);


const loadProducts = async()=>{

const user = auth.currentUser;

if(!user) return;

const q = query(
collection(db,"products"),
where("sellerId","==",user.uid)
);

const snap = await getDocs(q);

setProducts(
snap.docs.map(d=>({
id:d.id,
...d.data()
}))
);

};



const createPromotion = async(e:any)=>{

e.preventDefault();

setLoading(true);

try{

const user = auth.currentUser;

await addDoc(
collection(db,"promotions"),
{
sellerId:user?.uid,
productId:product,
discount:Number(discount),
createdAt:serverTimestamp()
}
);

alert("Promotion created");

setProduct("");
setDiscount("");

}catch(err){

console.log(err);
alert("Promotion failed");

}

setLoading(false);

};



return(

<div className="max-w-xl">

<h1 className="text-2xl font-bold mb-6">
Create Promotion
</h1>

<form onSubmit={createPromotion} className="space-y-4">

<select
value={product}
onChange={(e)=>setProduct(e.target.value)}
className="border p-3 w-full rounded"
>

<option value="">
Select Product
</option>

{products.map((p:any)=>(
<option key={p.id} value={p.id}>
{p.name}
</option>
))}

</select>

<input
placeholder="Discount %"
value={discount}
onChange={(e)=>setDiscount(e.target.value)}
className="border p-3 w-full rounded"
/>

<button
type="submit"
className="bg-black text-white px-5 py-3 rounded"
>

{loading ? "Creating..." : "Create Promotion"}

</button>

</form>

</div>

);

}

"use client";

import { useEffect, useState } from "react";
import {
collection,
addDoc,
getDocs,
deleteDoc,
doc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function OffersAdminPage(){

const [type,setType] = useState("product");
const [products,setProducts] = useState<any[]>([]);
const [categories,setCategories] = useState<string[]>([]);
const [offers,setOffers] = useState<any[]>([]);

const [productId,setProductId] = useState("");
const [category,setCategory] = useState("");
const [discount,setDiscount] = useState("");

const [hours,setHours] = useState("24");

useEffect(()=>{

const loadData = async()=>{

const productSnap = await getDocs(collection(db,"products"));
const offerSnap = await getDocs(collection(db,"offers"));

const productList = productSnap.docs.map(d=>({
id:d.id,
...d.data()
}));

setProducts(productList);

const cats = Array.from(
new Set(productList.map((p:any)=>p.category))
);

setCategories(cats as string[]);

setOffers(
offerSnap.docs.map(d=>({
id:d.id,
...d.data()
}))
);

};

loadData();

},[]);

const addOffer = async()=>{

if(!discount) return alert("Enter discount");

const endDate = new Date();
endDate.setHours(endDate.getHours()+Number(hours));

await addDoc(collection(db,"offers"),{

type,
productId: type==="product"?productId:null,
category: type==="category"?category:null,

discount:Number(discount),

active:true,
endDate:endDate.toISOString()

});

location.reload();

};

const removeOffer = async(id:string)=>{

await deleteDoc(doc(db,"offers",id));
location.reload();

};

return(

<div className="p-4 max-w-xl mx-auto">

<h1 className="text-2xl font-bold mb-4">
Offer Management
</h1>

<select
value={type}
onChange={(e)=>setType(e.target.value)}
className="border p-2 w-full mb-3"
>

<option value="product">Product Offer</option>
<option value="category">Category Offer</option>

</select>

{type==="product" && (

<select
value={productId}
onChange={(e)=>setProductId(e.target.value)}
className="border p-2 w-full mb-3"
>

<option>Select Product</option>

{products.map((p:any)=>(
<option key={p.id} value={p.id}>
{p.name}
</option>
))}

</select>

)}

{type==="category" && (

<select
value={category}
onChange={(e)=>setCategory(e.target.value)}
className="border p-2 w-full mb-3"
>

<option>Select Category</option>

{categories.map((c)=>(
<option key={c} value={c}>
{c}
</option>
))}

</select>

)}

<input
type="number"
placeholder="Discount %"
value={discount}
onChange={(e)=>setDiscount(e.target.value)}
className="border p-2 w-full mb-3"
/>

<p className="text-pink-600 font-bold mb-3">
{discount || 0}% OFF
</p>

<select
value={hours}
onChange={(e)=>setHours(e.target.value)}
className="border p-2 w-full mb-3"
>

<option value="6">6 Hours</option>
<option value="12">12 Hours</option>
<option value="24">24 Hours</option>
<option value="48">48 Hours</option>

</select>

<button
onClick={addOffer}
className="bg-pink-600 text-white w-full py-2 rounded"
>

Add

</button>

{/* ACTIVE OFFERS */}

<div className="mt-6 space-y-4">

{offers.map((o:any)=>(

<div
key={o.id}
className="border p-3 rounded-lg bg-white shadow"
>

<p className="font-semibold">

{o.type==="product"
? `Product ID: ${o.productId}`
: `Category: ${o.category}`}

</p>

<p className="text-pink-600 font-bold">
{o.discount}% OFF
</p>

<div className="flex gap-2 mt-2">

<button className="bg-green-500 text-white px-3 py-1 rounded">
Active
</button>

<button
onClick={()=>removeOffer(o.id)}
className="bg-red-500 text-white px-3 py-1 rounded"
>

Delete

</button>

</div>

</div>

))}

</div>

</div>

);

}

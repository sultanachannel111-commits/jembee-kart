"use client";

import { useEffect,useState } from "react";
import {
collection,
addDoc,
onSnapshot,
deleteDoc,
doc,
updateDoc
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export default function AdminAiOffers(){

const [offers,setOffers]=useState<any[]>([]);

const [type,setType]=useState("festival");
const [title,setTitle]=useState("");
const [discount,setDiscount]=useState(20);
const [category,setCategory]=useState("");
const [startDate,setStartDate]=useState("");
const [endDate,setEndDate]=useState("");


// LOAD

useEffect(()=>{

const unsub = onSnapshot(
collection(db,"aiOffers"),
snap=>{
setOffers(
snap.docs.map(d=>({
id:d.id,
...d.data()
}))
);
}
);

return ()=>unsub();

},[]);


// ADD

async function addOffer(){

await addDoc(collection(db,"aiOffers"),{

type,
title,
discount:Number(discount),
category,
startDate,
endDate,
active:true,
createdAt:new Date()

});

setTitle("");
setDiscount(20);
setCategory("");

}


// DELETE

async function deleteOffer(id:string){

await deleteDoc(doc(db,"aiOffers",id));

}


// TOGGLE

async function toggle(id:string,current:boolean){

await updateDoc(
doc(db,"aiOffers",id),
{
active:!current
}
);

}


return(

<div className="p-6 space-y-6">

<h1 className="text-3xl font-bold text-purple-600">
AI Offer Engine
</h1>


{/* CREATE OFFER */}

<div className="grid md:grid-cols-6 gap-3">

<select
value={type}
onChange={(e)=>setType(e.target.value)}
className="border p-2 rounded"
>

<option value="festival">
Festival Sale
</option>

<option value="trending">
Trending Sale
</option>

<option value="clearance">
Clearance Sale
</option>

</select>


<input
placeholder="Title"
value={title}
onChange={(e)=>setTitle(e.target.value)}
className="border p-2 rounded"
/>


<input
type="number"
value={discount}
onChange={(e)=>setDiscount(Number(e.target.value))}
className="border p-2 rounded"
/>


<input
placeholder="Category"
value={category}
onChange={(e)=>setCategory(e.target.value)}
className="border p-2 rounded"
/>


<input
type="date"
value={startDate}
onChange={(e)=>setStartDate(e.target.value)}
className="border p-2 rounded"
/>


<input
type="date"
value={endDate}
onChange={(e)=>setEndDate(e.target.value)}
className="border p-2 rounded"
/>


<button
onClick={addOffer}
className="bg-purple-600 text-white px-4 py-2 rounded"
>

Add AI Offer

</button>

</div>


{/* OFFER LIST */}

<div className="grid md:grid-cols-3 gap-4">

{offers.map(o=>(

<div key={o.id} className="bg-white p-4 rounded shadow">

<p className="font-semibold">
{o.title}
</p>

<p className="text-purple-600 font-bold">
{o.discount}% OFF
</p>

<p>
Type: {o.type}
</p>

<p>
Category: {o.category}
</p>

<div className="flex gap-2 mt-3">

<button
onClick={()=>toggle(o.id,o.active)}
className="bg-green-500 text-white px-3 py-1 rounded text-sm"
>

{o.active?"Active":"Inactive"}

</button>

<button
onClick={()=>deleteOffer(o.id)}
className="bg-red-500 text-white px-3 py-1 rounded text-sm"
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

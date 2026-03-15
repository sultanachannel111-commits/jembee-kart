"use client";

import { useState } from "react";
import { collection,getDocs,doc,updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AutoBugFixer(){

const [status,setStatus]=useState("Ready")

async function runFix(){

setStatus("Fixing Bugs...")

/* FIX PRODUCT IMAGES */

const productsSnap = await getDocs(collection(db,"products"))

for(const p of productsSnap.docs){

const data=p.data()

if(!data.image){

await updateDoc(doc(db,"products",p.id),{
image:"https://via.placeholder.com/400"
})

}

if(!data.searchIndex){

await updateDoc(doc(db,"products",p.id),{
searchIndex:(data.name||"").toLowerCase()
})

}

}

/* LAZY LOAD IMAGES */

document.querySelectorAll("img").forEach((img:any)=>{
img.loading="lazy"
})

/* FIX SEARCH INPUT */

const search=document.querySelector("input[type='text']")

if(search){

search.removeAttribute("disabled")

}

/* CLEAR CACHE */

if("caches" in window){

caches.keys().then(names=>{
names.forEach(name=>{
caches.delete(name)
})
})

}

setStatus("Auto Fix Completed")

}

return(

<div className="p-6 space-y-6">

<h1 className="text-3xl font-bold">
AI Auto Bug Fixer
</h1>

<div className="bg-yellow-100 p-4 rounded shadow">
Status : {status}
</div>

<button
onClick={runFix}
className="bg-red-600 text-white px-4 py-2 rounded"
>
Run Auto Fix
</button>

</div>

)

}

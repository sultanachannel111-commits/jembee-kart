"use client";

import { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SearchMonitor(){

const [logs,setLogs] = useState<string[]>([]);
const [matches,setMatches] = useState<string[]>([]);
const [keyword,setKeyword] = useState("shirt");

function log(msg:string){
setLogs(prev=>[...prev,msg]);
}

async function runSearchTest(){

setLogs([]);
setMatches([]);

log("🔎 Starting Search Monitor...");

try{

log("📦 Loading products from Firestore...");

const snap = await getDocs(collection(db,"products"));

log(`Products Found : ${snap.size}`);

if(snap.size === 0){

log("❌ Error : No products in database");

log("🛠 Fix : Add products in Firestore collection 'products'");

return;

}

let found:string[] = [];

snap.docs.forEach((doc:any)=>{

const data = doc.data();

if(!data.name){

log(`❌ Product missing name → id: ${doc.id}`);

return;

}

if(data.name.toLowerCase().includes(keyword.toLowerCase())){

found.push(data.name);

}

});

if(found.length > 0){

log(`✅ Search Working → ${found.length} matches`);

setMatches(found);

}else{

log("❌ Search returned 0 results");

log("🛠 Fix suggestion:");

log("• Check product name spelling");
log("• Check search filter logic");
log("• Check normalize() function");

}

}catch(e:any){

log("❌ Runtime Error");

log(e.message);

log("🛠 Fix:");

log("• Check Firestore connection");
log("• Check products collection name");

}

}

return(

<div className="p-6 space-y-4">

<h1 className="text-3xl font-bold">
Search System Monitor
</h1>

<div className="flex gap-2">

<input
value={keyword}
onChange={(e)=>setKeyword(e.target.value)}
className="border p-2 rounded"
placeholder="Search keyword"
/>

<button
onClick={runSearchTest}
className="bg-blue-600 text-white px-4 py-2 rounded"
>
Run Search Test
</button>

</div>

<div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-[300px] overflow-y-auto">

{logs.map((l,i)=>(
<p key={i}>{l}</p>
))}

</div>

{matches.length > 0 && (

<div className="bg-white p-4 rounded shadow">

<h2 className="font-bold mb-2">
Matching Products
</h2>

<ul className="list-disc pl-6">

{matches.map((m,i)=>(
<li key={i}>{m}</li>
))}

</ul>

</div>

)}

</div>

);

}

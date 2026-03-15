"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function RuntimeCheck(){

const [logs,setLogs] = useState<string[]>([]);
const [loading,setLoading] = useState(false);

useEffect(()=>{
runCheck();
},[]);

function addLog(msg:string){
setLogs(prev => [...prev,msg]);
}

async function runCheck(){

setLoading(true);
setLogs([]);

try{

addLog("🔍 Checking Firestore connection...");

const p = await getDocs(collection(db,"products"));

addLog("✅ Firestore Connected");
addLog(`📦 Products Found : ${p.size}`);

}catch(e:any){

addLog("❌ Firestore Error");
addLog(e.message);

}

/* ---------------------- */
/* Search system check */
/* ---------------------- */

try{

addLog("🔍 Checking Search System...");

const res = await fetch("/api/search-test?q=shirt");

if(res.ok){

addLog("✅ Search API Working");

}else{

addLog("❌ Search API Error");

}

}catch(e:any){

addLog("❌ Search Runtime Error");
addLog(e.message);

}

/* ---------------------- */
/* Payment check */
/* ---------------------- */

try{

addLog("🔍 Checking Payment API...");

const pay = await fetch("/api/payment-test");

if(pay.ok){

addLog("✅ Payment API Working");

}else{

addLog("❌ Payment API Failed");

}

}catch(e:any){

addLog("❌ Payment Runtime Error");
addLog(e.message);

}

/* ---------------------- */
/* Qikink API check */
/* ---------------------- */

try{

addLog("🔍 Checking Qikink API...");

const q = await fetch("/api/qikink-test");

if(q.ok){

addLog("✅ Qikink API Working");

}else{

addLog("❌ Qikink API Failed");

}

}catch(e:any){

addLog("❌ Qikink Runtime Error");
addLog(e.message);

}

/* ---------------------- */
/* Website speed */
/* ---------------------- */

try{

addLog("⚡ Checking Website Speed...");

const start = performance.now();

await fetch("/");

const end = performance.now();

addLog(`⚡ Speed : ${Math.round(end-start)} ms`);

}catch(e:any){

addLog("❌ Speed Test Error");

}

setLoading(false);

}

return(

<div className="p-6 space-y-4">

<h1 className="text-3xl font-bold">
Runtime Error Scanner
</h1>

<button
onClick={runCheck}
className="bg-blue-600 text-white px-4 py-2 rounded"
>
Run Scan
</button>

<div className="bg-black text-green-400 p-4 rounded text-sm font-mono h-[400px] overflow-y-auto">

{loading && <p>Scanning project...</p>}

{logs.map((l,i)=>(
<p key={i}>{l}</p>
))}

</div>

</div>

);

}

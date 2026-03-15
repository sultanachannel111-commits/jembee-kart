"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function RuntimeMonitor(){

const [logs,setLogs] = useState<string[]>([]);
const [running,setRunning] = useState(false);

function addLog(msg:string){
setLogs(prev => [...prev,msg]);
}

useEffect(()=>{
runScan();
},[]);

async function runScan(){

setLogs([]);
setRunning(true);

addLog("🚀 Starting Full Project Runtime Scan...");

/* ---------------------------
THEME SYSTEM
--------------------------- */

try{

addLog("🎨 Checking Theme System...");

const themeLocal = localStorage.getItem("theme");

if(themeLocal){
addLog("✅ Theme found in localStorage");
}else{
addLog("❌ Theme missing in localStorage");
}

const ref = doc(db,"settings","theme");
const snap = await getDoc(ref);

if(snap.exists()){
addLog("✅ Theme document found in Firestore");
}else{
addLog("❌ Firestore theme document missing");
}

const css = getComputedStyle(document.documentElement)
.getPropertyValue("--admin-bg");

if(css){
addLog("✅ CSS variables applied");
}else{
addLog("❌ CSS theme variables missing");
}

}catch(e:any){
addLog("❌ Theme runtime error");
addLog(e.message);
}

/* ---------------------------
FIRESTORE DATABASE
--------------------------- */

try{

addLog("📦 Checking Firestore Products...");

const p = await getDocs(collection(db,"products"));

addLog(`Products Found : ${p.size}`);

}catch(e:any){

addLog("❌ Firestore products error");
addLog(e.message);

}

/* ---------------------------
ORDERS
--------------------------- */

try{

addLog("🛒 Checking Orders...");

const o = await getDocs(collection(db,"orders"));

addLog(`Orders Found : ${o.size}`);

}catch(e:any){

addLog("❌ Orders error");
addLog(e.message);

}

/* ---------------------------
SEARCH SYSTEM
--------------------------- */

try{

addLog("🔎 Checking Search System...");

const input = document.querySelector("input[type='text']");

if(input){
addLog("✅ Search input detected");
}else{
addLog("❌ Search input missing");
}

}catch{
addLog("❌ Search system error");
}

/* ---------------------------
API CHECK
--------------------------- */

const apis = [
"/api/payment-test",
"/api/theme",
"/api/qikink-test"
];

for(const api of apis){

try{

addLog(`🌐 Checking API ${api} ...`);

const res = await fetch(api);

if(res.ok){
addLog(`✅ ${api} working`);
}else{
addLog(`❌ ${api} failed`);
}

}catch{

addLog(`❌ ${api} unreachable`);

}

}

/* ---------------------------
IMAGE CHECK
--------------------------- */

try{

addLog("🖼 Checking images...");

let broken = 0;

document.querySelectorAll("img").forEach((img:any)=>{

if(!img.complete){
broken++;
}

});

addLog(`Broken Images : ${broken}`);

}catch{
addLog("❌ Image scan error");
}

/* ---------------------------
WEBSITE SPEED
--------------------------- */

try{

addLog("⚡ Checking page speed...");

const start = performance.now();

await fetch("/");

const end = performance.now();

addLog(`Page Load Speed : ${Math.round(end-start)} ms`);

}catch{

addLog("❌ Speed test failed");

}

addLog("✅ Runtime Scan Completed");

setRunning(false);

}

return(

<div className="p-6">

<h1 className="text-3xl font-bold mb-4">
Full Project Runtime Monitor
</h1>

<button
onClick={runScan}
className="bg-blue-600 text-white px-4 py-2 rounded"
>
Run Runtime Scan
</button>

<div className="bg-black text-green-400 p-4 mt-4 rounded h-[500px] overflow-auto font-mono text-sm">

{running && <p>Scanning project...</p>}

{logs.map((l,i)=>(
<p key={i}>{l}</p>
))}

</div>

</div>

);

}

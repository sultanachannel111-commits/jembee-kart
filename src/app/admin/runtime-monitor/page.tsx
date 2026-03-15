"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function RuntimeMonitor(){

const [logs,setLogs] = useState<string[]>([]);
const [running,setRunning] = useState(false);

function log(msg:string){
setLogs(prev=>[...prev,msg]);
}

useEffect(()=>{
runScan();
},[]);

async function runScan(){

setLogs([]);
setRunning(true);

log("🚀 Starting Full Runtime Scan...");

/* =========================
THEME SYSTEM
========================= */

try{

log("🎨 Checking Theme System...");

const themeLocal = localStorage.getItem("theme");

if(themeLocal){
log("✅ Theme found in localStorage");
}else{
log("❌ Theme missing in localStorage");
}

const cssVar = getComputedStyle(document.documentElement)
.getPropertyValue("--admin-bg");

if(cssVar){
log("✅ CSS Theme Variables Applied");
}else{
log("❌ CSS Theme Variables Missing");
}

}catch(e:any){

log("❌ Theme Runtime Error");
log(e.message);

}

/* =========================
FIRESTORE DATABASE
========================= */

try{

log("📦 Checking Firestore Collections...");

const products = await getDocs(collection(db,"products"));
log(`Products : ${products.size}`);

const orders = await getDocs(collection(db,"orders"));
log(`Orders : ${orders.size}`);

const users = await getDocs(collection(db,"users"));
log(`Users : ${users.size}`);

}catch(e:any){

log("❌ Firestore Connection Error");
log(e.message);

}

/* =========================
PAGES CHECK
========================= */

const pages = [
"/",
"/products",
"/cart",
"/checkout",
"/admin"
];

for(const p of pages){

try{

const res = await fetch(p);

if(res.ok){
log(`📄 Page OK → ${p}`);
}else{
log(`❌ Page Error → ${p}`);
}

}catch{
log(`❌ Page Unreachable → ${p}`);
}

}

/* =========================
API CHECK
========================= */

const apis = [
"/api/payment-test",
"/api/theme",
"/api/qikink-test"
];

for(const api of apis){

try{

log(`🌐 Checking API ${api}`);

const res = await fetch(api);

if(res.ok){
log(`✅ API Working → ${api}`);
}else{
log(`❌ API Error → ${api}`);
}

}catch{
log(`❌ API Unreachable → ${api}`);
}

}

/* =========================
SEARCH SYSTEM
========================= */

try{

log("🔎 Checking Search System...");

const res = await fetch("/?search=test");

if(res.ok){
log("✅ Homepage reachable for search");
}else{
log("❌ Homepage search error");
}

}catch{

log("❌ Search system unreachable");

}

/* =========================
IMAGES CHECK
========================= */

try{

log("🖼 Checking Images...");

let broken = 0;

document.querySelectorAll("img").forEach((img:any)=>{

if(!img.complete){
broken++;
}

});

log(`Broken Images : ${broken}`);

}catch{

log("❌ Image scan failed");

}

/* =========================
WEBSITE SPEED
========================= */

try{

log("⚡ Checking Website Speed...");

const start = performance.now();

await fetch("/");

const end = performance.now();

log(`Page Load Time : ${Math.round(end-start)} ms`);

}catch{

log("❌ Speed test failed");

}

/* =========================
BROWSER STORAGE
========================= */

try{

log("💾 Checking Browser Storage...");

const local = Object.keys(localStorage).length;
const session = Object.keys(sessionStorage).length;

log(`localStorage keys : ${local}`);
log(`sessionStorage keys : ${session}`);

}catch{

log("❌ Storage check failed");

}

/* =========================
MEMORY
========================= */

try{

const memory = (performance as any).memory;

if(memory){

log(`Memory Used : ${Math.round(memory.usedJSHeapSize/1024/1024)} MB`);

}

}catch{}

log("✅ Runtime Scan Completed");

setRunning(false);

}

return(

<div className="p-6 space-y-4">

<h1 className="text-3xl font-bold">
Full Project Runtime Monitor
</h1>

<button
onClick={runScan}
className="bg-blue-600 text-white px-4 py-2 rounded"
>
Run Scan
</button>

<div className="bg-black text-green-400 p-4 rounded h-[500px] overflow-y-auto font-mono text-sm">

{running && <p>Scanning project...</p>}

{logs.map((l,i)=>(
<p key={i}>{l}</p>
))}

</div>

</div>

);

}

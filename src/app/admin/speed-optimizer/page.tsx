"use client";

import { useEffect,useState } from "react";

export default function SpeedOptimizer(){

const [pageSpeed,setPageSpeed]=useState("")
const [slowImages,setSlowImages]=useState<any[]>([])
const [heavyScripts,setHeavyScripts]=useState<any[]>([])
const [score,setScore]=useState(100)

useEffect(()=>{
scanWebsite()
},[])

function scanWebsite(){

/* PAGE SPEED */

const nav = performance.getEntriesByType("navigation")[0] as any

if(nav){

const loadTime = nav.loadEventEnd - nav.startTime

if(loadTime > 4000){

setPageSpeed("Very Slow ("+loadTime+"ms)")
setScore((s)=>s-40)

}else if(loadTime > 2000){

setPageSpeed("Slow ("+loadTime+"ms)")
setScore((s)=>s-20)

}else{

setPageSpeed("Fast ("+loadTime+"ms)")

}

}

/* IMAGE CHECK */

let heavy:any[]=[]

document.querySelectorAll("img").forEach((img:any)=>{

if(!img.loading){

heavy.push({
src:img.src,
issue:"Lazy loading missing"
})

}

if(img.naturalWidth > 2000){

heavy.push({
src:img.src,
issue:"Very large image"
})

}

})

setSlowImages(heavy)

/* SCRIPT CHECK */

let scripts:any[]=[]

document.querySelectorAll("script").forEach((s:any)=>{

if(s.src && !s.defer){

scripts.push({
src:s.src,
issue:"defer missing"
})

}

})

setHeavyScripts(scripts)

}

/* AUTO FIX */

function autoFix(){

/* LAZY LOAD IMAGES */

document.querySelectorAll("img").forEach((img:any)=>{
img.loading="lazy"
})

/* DEFER SCRIPTS */

document.querySelectorAll("script").forEach((s:any)=>{
s.defer=true
})

alert("Speed Optimization Applied")

}

/* CLEAR CACHE */

function clearCache(){

if("caches" in window){

caches.keys().then(names=>{
names.forEach(name=>{
caches.delete(name)
})
})

}

alert("Browser Cache Cleared")

}

return(

<div className="p-6 space-y-6">

<h1 className="text-3xl font-bold">
AI Speed Optimizer
</h1>

<div className="bg-green-100 p-4 rounded shadow">
Speed Score : {score} / 100
</div>

<div className="bg-white p-4 rounded shadow">
Page Speed : {pageSpeed}
</div>

<h2 className="text-xl font-bold">
Slow Images
</h2>

{slowImages.map((img,i)=>(
<div key={i} className="bg-red-100 p-3 rounded">
Image Issue : {img.issue}
<br/>
{img.src}
</div>
))}

<h2 className="text-xl font-bold">
Heavy Scripts
</h2>

{heavyScripts.map((s,i)=>(
<div key={i} className="bg-red-100 p-3 rounded">
Script Issue : {s.issue}
<br/>
{s.src}
</div>
))}

<div className="flex gap-3">

<button
onClick={scanWebsite}
className="bg-pink-600 text-white px-4 py-2 rounded"
>
Scan Website
</button>

<button
onClick={autoFix}
className="bg-green-600 text-white px-4 py-2 rounded"
>
Auto Speed Fix
</button>

<button
onClick={clearCache}
className="bg-blue-600 text-white px-4 py-2 rounded"
>
Clear Cache
</button>

</div>

</div>

)

}

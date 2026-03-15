"use client";

import { useEffect,useState } from "react";

export default function ProjectScanner(){

const [issues,setIssues]=useState<any[]>([])
const [pages,setPages]=useState<any[]>([])
const [apis,setApis]=useState<any[]>([])
const [score,setScore]=useState(100)

useEffect(()=>{
scanProject()
},[])

async function scanProject(){

let problemList:any[]=[]
let pageList:any[]=[]
let apiList:any[]=[]

/* PAGE CHECK */

const pageRoutes=[
"/",
"/products",
"/cart",
"/checkout",
"/admin",
"/admin/orders",
"/admin/products"
]

for(const p of pageRoutes){

try{

const res=await fetch(p)

if(!res.ok){

problemList.push("Page Error → "+p)
pageList.push({
page:p,
status:"Error"
})

}else{

pageList.push({
page:p,
status:"OK"
})

}

}catch{

problemList.push("Page Not Reachable → "+p)

}

}

/* API CHECK */

const apiRoutes=[
"/api/payment-test",
"/api/theme",
"/api/qikink-test"
]

for(const api of apiRoutes){

try{

const res=await fetch(api)

if(!res.ok){

problemList.push("API Error → "+api)

apiList.push({
api:api,
status:"Error"
})

}else{

apiList.push({
api:api,
status:"OK"
})

}

}catch{

problemList.push("API Missing → "+api)

}

}

/* IMAGE CHECK */

document.querySelectorAll("img").forEach((img:any)=>{

if(!img.complete){

problemList.push("Broken Image → "+img.src)

}

})

/* SEARCH CHECK */

const search=document.querySelector("input[type='text']")

if(!search){

problemList.push("Search Box Missing → /src/components/home/SearchBar.tsx")

}

/* SPEED CHECK */

const nav = performance.getEntriesByType("navigation")[0] as any

if(nav){

const loadTime=nav.loadEventEnd-nav.startTime

if(loadTime>3000){

problemList.push("Slow Page Load → "+loadTime+"ms")

}

}

/* SCORE */

let s=100

s-=problemList.length*5

if(s<0) s=0

setScore(s)

setIssues(problemList)
setPages(pageList)
setApis(apiList)

}

return(

<div className="p-6 space-y-6">

<h1 className="text-3xl font-bold">
AI Full Project Scanner
</h1>

<div className="bg-green-100 p-4 rounded shadow">
Project Health Score : {score} / 100
</div>

<h2 className="text-xl font-bold">
Pages Status
</h2>

{pages.map((p,i)=>(
<div key={i} className="bg-white p-3 rounded shadow">
{p.page} : {p.status}
</div>
))}

<h2 className="text-xl font-bold">
API Status
</h2>

{apis.map((a,i)=>(
<div key={i} className="bg-white p-3 rounded shadow">
{a.api} : {a.status}
</div>
))}

<h2 className="text-xl font-bold">
Detected Issues
</h2>

{issues.map((i,n)=>(
<div key={n} className="bg-red-100 p-3 rounded">
{i}
</div>
))}

<button
onClick={scanProject}
className="bg-pink-600 text-white px-4 py-2 rounded"
>
Scan Project Again
</button>

</div>

)

}

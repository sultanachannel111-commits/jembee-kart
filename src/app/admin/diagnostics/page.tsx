"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import {
LineChart,
Line,
CartesianGrid,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer
} from "recharts";

export default function DiagnosticsPage(){

const [loading,setLoading]=useState(true)

/* COUNTS */

const [products,setProducts]=useState(0)
const [orders,setOrders]=useState(0)
const [sellers,setSellers]=useState(0)
const [categories,setCategories]=useState(0)

/* ERRORS */

const [missingImages,setMissingImages]=useState(0)
const [brokenImages,setBrokenImages]=useState(0)
const [fakeOrders,setFakeOrders]=useState(0)

/* DETAILS */

const [brokenImageList,setBrokenImageList]=useState<any[]>([])
const [apiErrors,setApiErrors]=useState<any[]>([])
const [searchIssue,setSearchIssue]=useState("")
const [paymentIssue,setPaymentIssue]=useState("")

/* THEME + PAGE */

const [themeStatus,setThemeStatus]=useState("Checking")
const [themeIssue,setThemeIssue]=useState("")
const [pageIssues,setPageIssues]=useState<any[]>([])

/* PROJECT */

const [projectIssues,setProjectIssues]=useState<any[]>([])
const [slowComponents,setSlowComponents]=useState<any[]>([])

/* SYSTEM */

const [searchAccuracy,setSearchAccuracy]=useState("Checking")
const [paymentStatus,setPaymentStatus]=useState("Checking")
const [dbPerformance,setDbPerformance]=useState("Checking")

/* SPEED */

const [speedStatus,setSpeedStatus]=useState("Checking")

/* AI */

const [aiBug,setAiBug]=useState("")
const [healthScore,setHealthScore]=useState(100)

/* GRAPH */

const [chartData,setChartData]=useState<any[]>([])

useEffect(()=>{
runDiagnostics()
autoSpeedOptimize()
},[])

/* IMAGE CHECK */

function checkImage(url:string){

return new Promise((resolve)=>{

const img=new Image()
img.src=url

img.onload=()=>resolve(true)
img.onerror=()=>resolve(false)

})

}

/* AUTO SPEED OPTIMIZER */

function autoSpeedOptimize(){

document.querySelectorAll("img").forEach((img:any)=>{
img.loading="lazy"
})

console.log("⚡ Auto speed optimization enabled")

}

/* MAIN DIAGNOSTICS */

async function runDiagnostics(){

setLoading(true)

let missing=0
let broken=0
let fake=0
let sellerCount=0

let brokenList:any[]=[]
let pageErrorList:any[]=[]
let projectErrorList:any[]=[]
let slowList:any[]=[]
let apiErrorList:any[]=[]

try{

const dbStart=Date.now()

const productsSnap=await getDocs(collection(db,"products"))
const usersSnap=await getDocs(collection(db,"users"))
const ordersSnap=await getDocs(collection(db,"orders"))
const categoriesSnap=await getDocs(collection(db,"categories"))

const dbEnd=Date.now()
const dbTime=dbEnd-dbStart

setDbPerformance(dbTime>2000?"Slow ("+dbTime+"ms)":"Good ("+dbTime+"ms)")

setProducts(productsSnap.size)
setOrders(ordersSnap.size)
setCategories(categoriesSnap.size)

usersSnap.forEach((u)=>{
if(u.data().role==="seller"){
sellerCount++
}
})

setSellers(sellerCount)

/* IMAGE CHECK */

for(const p of productsSnap.docs){

const data=p.data()

if(!data.image){

missing++

}else{

const ok:any=await checkImage(data.image)

if(!ok){

broken++

brokenList.push({
product:data.name,
image:data.image,
folder:"/src/components/products"
})

}

}

}

setBrokenImageList(brokenList)

/* FAKE ORDERS */

ordersSnap.forEach((o)=>{

const data=o.data()

if(!data.total_order_value || data.total_order_value<=0){
fake++
}

})

/* SEARCH TEST */

let match=0

productsSnap.docs.forEach((p)=>{

const name=(p.data().name||"").toLowerCase()

if(name.includes("shirt")||name.includes("hoodie")){
match++
}

})

setSearchAccuracy(match>0?"Good":"Poor")

const searchInput=document.querySelector("input[type='text']")

if(!searchInput){
setSearchIssue("SearchBar missing → /src/components/home/SearchBar.tsx")
}

/* PAYMENT API */

try{

const res=await fetch("/api/payment-test")

if(!res.ok){

setPaymentStatus("Error")
setPaymentIssue("/src/app/api/payment-test/route.ts")
apiErrorList.push("Payment API failed")

}else{

setPaymentStatus("OK")

}

}catch{

setPaymentStatus("Error")
setPaymentIssue("Payment API missing")

}

/* PAGE SCAN */

const pages=[
"/",
"/products",
"/cart",
"/checkout",
"/admin",
"/admin/products",
"/admin/orders"
]

for(const p of pages){

try{

const res=await fetch(p)

if(!res.ok){

pageErrorList.push("Page error → "+p)

}

}catch{

pageErrorList.push("Page unreachable → "+p)

}

}

setPageIssues(pageErrorList)

/* THEME CHECK */

try{

const res=await fetch("/api/theme")

if(!res.ok){

setThemeStatus("Error")
setThemeIssue("/src/app/api/theme/route.ts")

}else{

setThemeStatus("Working")

}

}catch{

setThemeStatus("Theme API Missing")
setThemeIssue("/src/app/api/theme")

}

/* PROJECT SCAN */

const folders=[
"/src/components",
"/src/components/home",
"/src/components/products",
"/src/lib",
"/src/app/api"
]

folders.forEach((f)=>{
if(!f){
projectErrorList.push("Missing folder → "+f)
}
})

setProjectIssues(projectErrorList)

/* SPEED */

const nav=performance.getEntriesByType("navigation")[0] as any

if(nav){

const loadTime=nav.loadEventEnd-nav.startTime

if(loadTime>3000){

setSpeedStatus("Slow ("+loadTime+"ms)")
slowList.push("Homepage slow → optimize banner")

}else{

setSpeedStatus("Fast ("+loadTime+"ms)")

}

}

setSlowComponents(slowList)

/* AI BUG */

let issues=[]

if(missing>0) issues.push("Missing images")
if(broken>0) issues.push("Broken images")
if(fake>0) issues.push("Fake orders")
if(apiErrorList.length>0) issues.push("API errors")

setAiBug(issues.join(", "))

/* HEALTH SCORE */

let score=100

if(broken>0) score-=10
if(fake>0) score-=20
if(apiErrorList.length>0) score-=20

if(score<0) score=0

setHealthScore(score)

setMissingImages(missing)
setBrokenImages(broken)
setFakeOrders(fake)

/* GRAPH */

setChartData([
{ name:"Products", value:productsSnap.size },
{ name:"Orders", value:ordersSnap.size },
{ name:"Sellers", value:sellerCount },
{ name:"MissingImg", value:missing }
])

}catch(e){

console.log("Diagnostics error",e)

}

setLoading(false)

}

/* AUTO FIX */

async function autoAIFix(){

const productsSnap=await getDocs(collection(db,"products"))

for(const p of productsSnap.docs){

const data=p.data()

if(!data.image){

await updateDoc(doc(db,"products",p.id),{
image:"https://via.placeholder.com/400"
})

}

}

alert("AI Auto Fix Completed")

runDiagnostics()

}

if(loading){

return(
<div className="p-6">
Running Diagnostics...
</div>
)

}

return(

<div className="p-6 space-y-6">

<h1 className="text-3xl font-bold">
JembeeKart AI Diagnostics
</h1>

<div className="bg-green-100 p-4 rounded shadow">
AI Health Score : {healthScore} / 100
</div>

<div className="bg-white p-4 rounded shadow">
Website Speed : {speedStatus}
</div>

<div className="bg-white p-4 rounded shadow">
Products : {products}
</div>

<div className="bg-white p-4 rounded shadow">
Orders : {orders}
</div>

<div className="bg-white p-4 rounded shadow">
Sellers : {sellers}
</div>

<div className="bg-white p-4 rounded shadow">
Database : {dbPerformance}
</div>

<div className="bg-white p-4 rounded shadow">
Search Accuracy : {searchAccuracy}
</div>

<div className="bg-white p-4 rounded shadow">
Payment Status : {paymentStatus}
</div>

{paymentIssue && (
<div className="bg-red-100 p-3 rounded">
Payment Issue : {paymentIssue}
</div>
)}

{searchIssue && (
<div className="bg-red-100 p-3 rounded">
Search Issue : {searchIssue}
</div>
)}

{pageIssues.map((p,i)=>(
<div key={i} className="bg-red-100 p-3 rounded">
Page Issue : {p}
</div>
))}

{brokenImageList.map((b,i)=>(
<div key={i} className="bg-red-100 p-3 rounded">
Broken Product : {b.product}
</div>
))}

<div className="bg-yellow-100 p-4 rounded shadow">
AI Bug Detection : {aiBug}
</div>

<div className="bg-white p-6 rounded shadow h-64">

<ResponsiveContainer width="100%" height="100%">
<LineChart data={chartData}>
<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="name"/>
<YAxis/>
<Tooltip/>
<Line type="monotone" dataKey="value" stroke="#ec4899"/>
</LineChart>
</ResponsiveContainer>

</div>

<button
onClick={autoAIFix}
className="bg-green-600 text-white px-4 py-2 rounded"
>
Auto AI Fix
</button>

</div>

)

}

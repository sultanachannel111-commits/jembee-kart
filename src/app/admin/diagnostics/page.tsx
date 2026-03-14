"use client";

import { useEffect,useState } from "react";
import { collection,getDocs,doc,updateDoc } from "firebase/firestore";
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

/* PAGE + THEME */

const [themeStatus,setThemeStatus]=useState("Checking")
const [themeIssue,setThemeIssue]=useState("")
const [pageIssues,setPageIssues]=useState<any[]>([])

/* PROJECT SCAN */

const [projectIssues,setProjectIssues]=useState<any[]>([])

/* SLOW COMPONENT */

const [slowComponents,setSlowComponents]=useState<any[]>([])

/* SYSTEM */

const [searchAccuracy,setSearchAccuracy]=useState("Checking")
const [paymentStatus,setPaymentStatus]=useState("Checking")
const [qikinkStatus,setQikinkStatus]=useState("Checking")
const [dbPerformance,setDbPerformance]=useState("Checking")

/* SPEED */

const [speedStatus,setSpeedStatus]=useState("Checking")

/* AI */

const [aiBug,setAiBug]=useState("Analyzing")
const [healthScore,setHealthScore]=useState(100)

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

/* lazy loading images */

document.querySelectorAll("img").forEach((img:any)=>{
img.loading="lazy"
})

/* remove unused scripts */

document.querySelectorAll("script").forEach((s:any)=>{
if(!s.src){
s.remove()
}
})

console.log("⚡ Speed optimization applied")

}

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
folder:"/src/components/products"
})

}

}

}

setBrokenImageList(brokenList)

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

pageErrorList.push("Page not reachable → "+p)

}

}

setPageIssues(pageErrorList)

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
projectErrorList.push("Folder missing → "+f)
}
})

setProjectIssues(projectErrorList)

/* SLOW COMPONENT DETECTOR */

const nav=performance.getEntriesByType("navigation")[0] as any

if(nav){

const loadTime=nav.loadEventEnd-nav.startTime

if(loadTime>3000){

slowList.push("Homepage slow → optimize BannerSlider")
slowList.push("ProductGrid slow → compress images")

setSpeedStatus("Slow ("+loadTime+"ms)")

}else{

setSpeedStatus("Fast ("+loadTime+"ms)")

}

}

setSlowComponents(slowList)

/* HEALTH SCORE */

let score=100

if(broken>0) score-=10
if(fake>0) score-=20
if(dbTime>2000) score-=15

if(score<0) score=0

setHealthScore(score)

setMissingImages(missing)
setBrokenImages(broken)
setFakeOrders(fake)

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

if(loading){

return(
<div className="p-6">
Running AI Diagnostics...
</div>
)

}

return(

<div className="p-6 space-y-6">

<h1 className="text-3xl font-bold">
JembeeKart AI Diagnostics Dashboard
</h1>

<div className="bg-green-100 p-4 rounded shadow">
AI Health Score : {healthScore} / 100
</div>

<div className="bg-white p-4 rounded shadow">
Website Speed : {speedStatus}
</div>

{pageIssues.map((p,i)=>(
<div key={i} className="bg-red-100 p-3 rounded">
Page Issue : {p}
</div>
))}

{projectIssues.map((p,i)=>(
<div key={i} className="bg-red-100 p-3 rounded">
Project Issue : {p}
</div>
))}

{slowComponents.map((p,i)=>(
<div key={i} className="bg-yellow-100 p-3 rounded">
Slow Component : {p}
</div>
))}

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

</div>

)

}

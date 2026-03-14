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

/* SYSTEM */

const [searchAccuracy,setSearchAccuracy]=useState("Checking")
const [paymentStatus,setPaymentStatus]=useState("Checking")
const [qikinkStatus,setQikinkStatus]=useState("Checking")
const [dbPerformance,setDbPerformance]=useState("Checking")

const [seoIssues,setSeoIssues]=useState(0)
const [securityIssues,setSecurityIssues]=useState(0)

/* AI */

const [aiBug,setAiBug]=useState("Analyzing")
const [healthScore,setHealthScore]=useState(100)

/* SPEED */

const [speedStatus,setSpeedStatus]=useState("Checking")

const [chartData,setChartData]=useState<any[]>([])

useEffect(()=>{
runDiagnostics()
},[])

function checkImage(url:string){

return new Promise((resolve)=>{

const img=new Image()
img.src=url

img.onload=()=>resolve(true)
img.onerror=()=>resolve(false)

})

}

async function runDiagnostics(){

setLoading(true)

let missing=0
let broken=0
let fake=0
let sellerCount=0
let seoErr=0
let securityErr=0

let brokenList:any[]=[]
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

if(name.includes("tshirt")||name.includes("hoodie")){
match++
}

})

setSearchAccuracy(match>0?"Good":"Poor")

const searchInput=document.querySelector("input[type='text']")

if(!searchInput){
setSearchIssue("SearchBar missing → /src/components/home/SearchBar.tsx")
}

/* PAYMENT */

try{

const res=await fetch("/api/payment-test")

if(!res.ok){

setPaymentStatus("Error")
setPaymentIssue("Check API → /src/app/api/payment-test/route.ts")

apiErrorList.push("Payment API failed")

}else{

setPaymentStatus("OK")

}

}catch{

setPaymentStatus("Error")
setPaymentIssue("API Missing → /src/app/api/payment-test")

}

/* QIKINK */

try{

const res=await fetch("/api/qikink-test")

if(!res.ok){

setQikinkStatus("API Error")
apiErrorList.push("Qikink API error → /src/lib/qikink.ts")

}else{

setQikinkStatus("Connected")

}

}catch{

setQikinkStatus("Connection Failed")
apiErrorList.push("Qikink API missing")

}

setApiErrors(apiErrorList)

/* SEO */

if(!document.title){
seoErr++
}

document.querySelectorAll("img").forEach((img:any)=>{
if(!img.alt){
seoErr++
}
})

setSeoIssues(seoErr)

/* SECURITY */

if(location.protocol!=="https:"){
securityErr++
}

setSecurityIssues(securityErr)

/* SPEED TEST */

const nav=performance.getEntriesByType("navigation")[0] as any

if(nav){

const loadTime=nav.loadEventEnd-nav.startTime

if(loadTime>4000){
setSpeedStatus("Slow ("+loadTime+"ms)")
}else{
setSpeedStatus("Fast ("+loadTime+"ms)")
}

}

/* AI BUG DETECTION */

let issues=[]

if(missing>0) issues.push("Missing images → /src/components/products")
if(fake>0) issues.push("Fake orders → /src/app/admin/orders")
if(broken>0) issues.push("Broken product images → /public/products")
if(dbTime>2000) issues.push("Slow database → Firestore")
if(apiErrorList.length>0) issues.push("API errors detected")

if(issues.length===0){
setAiBug("No Issues Detected")
}else{
setAiBug(issues.join(", "))
}

/* HEALTH SCORE */

let score=100

if(broken>0) score-=10
if(fake>0) score-=20
if(dbTime>2000) score-=15
if(apiErrorList.length>0) score-=20
if(seoErr>0) score-=5

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

if(!data.searchIndex){

await updateDoc(doc(db,"products",p.id),{
searchIndex:(data.name||"").toLowerCase()
})

}

}

alert("AI Auto Fix Completed")

runDiagnostics()

}

/* SPEED OPTIMIZER */

function speedOptimize(){

document.querySelectorAll("img").forEach((img:any)=>{
img.loading="lazy"
})

alert("Website Speed Optimized")

}

/* TELEGRAM ALERT */

async function sendTelegramAlert(){

await fetch("/api/telegram-alert",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({
message:
"🚨 JembeeKart Bug Alert\n\n"+
"Health Score: "+healthScore+"\n"+
"Problems: "+aiBug
})
})

alert("Telegram alert sent")

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

<div className="grid grid-cols-2 gap-4">

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
Categories : {categories}
</div>

</div>

<div className="bg-white p-4 rounded shadow">
Database Performance : {dbPerformance}
</div>

<div className="bg-white p-4 rounded shadow">
Website Speed : {speedStatus}
</div>

<div className="bg-white p-4 rounded shadow">
Missing Images : {missingImages}
</div>

<div className="bg-white p-4 rounded shadow">
Broken Images : {brokenImages}
</div>

{brokenImageList.map((b,i)=>(
<div key={i} className="bg-red-100 p-3 rounded">
Broken Product : {b.product} <br/>
Folder : {b.folder}
</div>
))}

<div className="bg-white p-4 rounded shadow">
Fake Orders : {fakeOrders}
</div>

<div className="bg-white p-4 rounded shadow">
Search Accuracy : {searchAccuracy}
</div>

{searchIssue && (
<div className="bg-red-100 p-3 rounded">
Search Issue : {searchIssue}
</div>
)}

<div className="bg-white p-4 rounded shadow">
Payment Gateway : {paymentStatus}
</div>

{paymentIssue && (
<div className="bg-red-100 p-3 rounded">
Payment Issue : {paymentIssue}
</div>
)}

<div className="bg-white p-4 rounded shadow">
Qikink API : {qikinkStatus}
</div>

{apiErrors.map((a,i)=>(
<div key={i} className="bg-red-100 p-3 rounded">
API Error : {a}
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

<div className="flex flex-wrap gap-3">

<button
onClick={runDiagnostics}
className="bg-pink-600 text-white px-4 py-2 rounded"
>
Run Diagnostics
</button>

<button
onClick={autoAIFix}
className="bg-green-600 text-white px-4 py-2 rounded"
>
Auto AI Fix
</button>

<button
onClick={speedOptimize}
className="bg-blue-600 text-white px-4 py-2 rounded"
>
Speed Optimize
</button>

<button
onClick={sendTelegramAlert}
className="bg-red-600 text-white px-4 py-2 rounded"
>
Send Bug Alert
</button>

</div>

</div>

)

}

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

/* SYSTEM */

const [searchAccuracy,setSearchAccuracy]=useState("Checking")
const [paymentStatus,setPaymentStatus]=useState("Checking")
const [qikinkStatus,setQikinkStatus]=useState("Checking")

const [dbPerformance,setDbPerformance]=useState("Checking")
const [seoIssues,setSeoIssues]=useState(0)
const [securityIssues,setSecurityIssues]=useState(0)

const [aiBug,setAiBug]=useState("Analyzing")

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

try{

/* DATABASE PERFORMANCE */

const dbStart=Date.now()

const productsSnap=await getDocs(collection(db,"products"))
const usersSnap=await getDocs(collection(db,"users"))
const ordersSnap=await getDocs(collection(db,"orders"))
const categoriesSnap=await getDocs(collection(db,"categories"))

const dbEnd=Date.now()
const dbTime=dbEnd-dbStart

setDbPerformance(dbTime>2000 ? "Slow ("+dbTime+"ms)" : "Good ("+dbTime+"ms)")

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
}

}

}

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

/* PAYMENT TEST */

try{
const res=await fetch("/api/payment-test")
setPaymentStatus(res.ok?"OK":"Error")
}catch{
setPaymentStatus("Error")
}

/* QIKINK TEST */

try{
const res=await fetch("/api/qikink-test")
setQikinkStatus(res.ok?"Connected":"API Error")
}catch{
setQikinkStatus("Connection Failed")
}

/* SEO SCAN */

if(!document.title){
seoErr++
}

document.querySelectorAll("img").forEach((img)=>{
if(!img.alt){
seoErr++
}
})

setSeoIssues(seoErr)

/* SECURITY SCAN */

if(location.protocol!=="https:"){
securityErr++
}

setSecurityIssues(securityErr)

/* AI BUG DETECTION */

let issues=[]

if(missing>0) issues.push("Missing images")
if(fake>0) issues.push("Fake orders")
if(broken>0) issues.push("Broken images")
if(dbTime>2000) issues.push("Slow database")

if(issues.length===0){
setAiBug("No Issues Detected")
}else{
setAiBug(issues.join(", "))
}

setMissingImages(missing)
setBrokenImages(broken)
setFakeOrders(fake)

/* GRAPH DATA */

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

/* AUTO AI FIX */

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

alert("AI Fix Applied")

runDiagnostics()

}

/* SEARCH ENGINE REPAIR */

async function rebuildSearchIndex(){

const productsSnap=await getDocs(collection(db,"products"))

for(const p of productsSnap.docs){

const data=p.data()

await updateDoc(doc(db,"products",p.id),{
searchIndex:(data.name||"").toLowerCase()
})

}

alert("Search index rebuilt")

}

/* TELEGRAM ALERT */

async function sendTelegramAlert(){

await fetch("/api/telegram-alert",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({
message:"🚨 JembeeKart Bug Detected: "+aiBug
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
Missing Images : {missingImages}
</div>

<div className="bg-white p-4 rounded shadow">
Broken Images : {brokenImages}
</div>

<div className="bg-white p-4 rounded shadow">
Fake Orders : {fakeOrders}
</div>

<div className="bg-white p-4 rounded shadow">
Search Accuracy : {searchAccuracy}
</div>

<div className="bg-white p-4 rounded shadow">
Payment Gateway : {paymentStatus}
</div>

<div className="bg-white p-4 rounded shadow">
Qikink API : {qikinkStatus}
</div>

<div className="bg-white p-4 rounded shadow">
SEO Issues : {seoIssues}
</div>

<div className="bg-white p-4 rounded shadow">
Security Issues : {securityIssues}
</div>

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
onClick={rebuildSearchIndex}
className="bg-blue-600 text-white px-4 py-2 rounded"
>
Repair Search Engine
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

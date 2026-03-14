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
let pageErrorList:any[]=[]

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
setPaymentIssue("/src/app/api/payment-test/route.ts")

apiErrorList.push("Payment API failed")

}else{

setPaymentStatus("OK")

}

}catch{

setPaymentStatus("Error")
setPaymentIssue("Payment API missing")

}

/* QIKINK */

try{

const res=await fetch("/api/qikink-test")

if(!res.ok){

setQikinkStatus("API Error")
apiErrorList.push("Qikink error → /src/lib/qikink.ts")

}else{

setQikinkStatus("Connected")

}

}catch{

setQikinkStatus("Connection Failed")
apiErrorList.push("Qikink API missing")

}

setApiErrors(apiErrorList)

/* THEME CHECK */

try{

const themeRes=await fetch("/api/theme")

if(!themeRes.ok){

setThemeStatus("Error")
setThemeIssue("/src/app/api/theme/route.ts")

}else{

const themeData=await themeRes.json()

if(!themeData.primaryColor){

setThemeStatus("Invalid")
setThemeIssue("Firestore settings/theme missing")

}else{

setThemeStatus("Working")

}

}

}catch{

setThemeStatus("Theme API Missing")
setThemeIssue("/src/app/api/theme")

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

pageErrorList.push("Page not reachable → "+p)

}

}

setPageIssues(pageErrorList)

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

/* SPEED */

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

if(missing>0) issues.push("Missing images")
if(fake>0) issues.push("Fake orders")
if(broken>0) issues.push("Broken images")
if(dbTime>2000) issues.push("Slow database")
if(apiErrorList.length>0) issues.push("API errors")

setAiBug(issues.join(", "))

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

}

alert("AI Auto Fix Completed")

runDiagnostics()

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
Theme System : {themeStatus}
</div>

{themeIssue && (
<div className="bg-red-100 p-3 rounded">
Theme Issue : {themeIssue}
</div>
)}

{pageIssues.map((p,i)=>(
<div key={i} className="bg-red-100 p-3 rounded">
Page Issue : {p}
</div>
))}

</div>

)

}

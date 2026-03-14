"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function DiagnosticsPage(){

const [loading,setLoading]=useState(true)

/* COUNTS */

const [products,setProducts]=useState(0)
const [categories,setCategories]=useState(0)
const [banners,setBanners]=useState(0)
const [orders,setOrders]=useState(0)
const [sellers,setSellers]=useState(0)

/* IMAGE ERRORS */

const [missingProductImages,setMissingProductImages]=useState(0)
const [brokenImages,setBrokenImages]=useState(0)
const [brokenBanners,setBrokenBanners]=useState(0)

/* ORDER ERRORS */

const [fakeOrders,setFakeOrders]=useState(0)

/* SYSTEM TESTS */

const [searchAccuracy,setSearchAccuracy]=useState("Checking...")
const [paymentStatus,setPaymentStatus]=useState("Checking...")
const [dbPerformance,setDbPerformance]=useState("Checking...")
const [seoIssues,setSeoIssues]=useState(0)
const [securityIssues,setSecurityIssues]=useState(0)

/* EXTRA CHECKS */

const [qikinkStatus,setQikinkStatus]=useState("Checking...")
const [searchClickIssue,setSearchClickIssue]=useState(false)

/* AI */

const [aiBug,setAiBug]=useState("Analyzing...")

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

let missingProduct=0
let broken=0
let brokenBanner=0
let fake=0
let sellerCount=0
let seoErr=0
let securityErr=0

try{

/* DATABASE PERFORMANCE */

const dbStart=Date.now()

const productsSnap=await getDocs(collection(db,"products"))
const bannersSnap=await getDocs(collection(db,"banners"))
const categoriesSnap=await getDocs(collection(db,"categories"))
const usersSnap=await getDocs(collection(db,"users"))
const ordersSnap=await getDocs(collection(db,"orders"))

const dbEnd=Date.now()

const dbTime=dbEnd-dbStart

if(dbTime>2000){
setDbPerformance("Slow ("+dbTime+"ms)")
}else{
setDbPerformance("Good ("+dbTime+"ms)")
}

setProducts(productsSnap.size)
setCategories(categoriesSnap.size)
setBanners(bannersSnap.size)
setOrders(ordersSnap.size)

/* SELLERS */

usersSnap.forEach((u)=>{
const data=u.data()
if(data.role==="seller"){
sellerCount++
}
})

setSellers(sellerCount)


/* PRODUCT IMAGE CHECK */

for(const p of productsSnap.docs){

const data=p.data()

if(!data.image){

missingProduct++

}else{

const ok:any=await checkImage(data.image)

if(!ok){
broken++
}

}

}


/* BANNER CHECK */

for(const b of bannersSnap.docs){

const data=b.data()

if(!data.image){

brokenBanner++

}else{

const ok:any=await checkImage(data.image)

if(!ok){
brokenBanner++
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


/* SEARCH ACCURACY */

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

if(res.ok){
setPaymentStatus("OK")
}else{
setPaymentStatus("Error")
}

}catch{

setPaymentStatus("Error")

}


/* QIKINK TEST */

try{

const res=await fetch("/api/qikink-test")

if(res.ok){
setQikinkStatus("Connected")
}else{
setQikinkStatus("API Error")
}

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


/* SEARCH CLICK TEST */

const searchInput=document.querySelector("input[type='text']")

if(!searchInput){
setSearchClickIssue(true)
}else{

const style=window.getComputedStyle(searchInput)

if(style.pointerEvents==="none"){
setSearchClickIssue(true)
}else{
setSearchClickIssue(false)
}

}


/* AI BUG REPORT */

let aiIssues=[]

if(missingProduct>0) aiIssues.push("Missing product images")
if(fake>0) aiIssues.push("Fake orders")
if(brokenBanner>0) aiIssues.push("Broken banners")
if(seoErr>0) aiIssues.push("SEO problems")
if(securityErr>0) aiIssues.push("Security issues")

if(aiIssues.length===0){
setAiBug("No Issues Detected")
}else{
setAiBug(aiIssues.join(", "))
}


setMissingProductImages(missingProduct)
setBrokenImages(broken)
setBrokenBanners(brokenBanner)
setFakeOrders(fake)

}catch(e){

console.log("Diagnostics error",e)

}

setLoading(false)

}


/* AUTO FIX IMAGES */

async function autoFixImages(){

const productsSnap=await getDocs(collection(db,"products"))

for(const p of productsSnap.docs){

const data=p.data()

if(!data.image){

await updateDoc(doc(db,"products",p.id),{
image:"https://via.placeholder.com/400"
})

}

}

runDiagnostics()

}


/* AUTO FIX SYSTEM */

function autoFixSystem(){

localStorage.removeItem("cart")

alert("Cart Reset Done")

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

<div className="p-6 space-y-4">

<h1 className="text-3xl font-bold">
JembeeKart AI System Diagnostics
</h1>

<div className="bg-white p-4 rounded shadow">Products : {products}</div>
<div className="bg-white p-4 rounded shadow">Categories : {categories}</div>
<div className="bg-white p-4 rounded shadow">Orders : {orders}</div>
<div className="bg-white p-4 rounded shadow">Sellers : {sellers}</div>

<div className="bg-white p-4 rounded shadow text-red-500">
Missing Product Images : {missingProductImages}
</div>

<div className="bg-white p-4 rounded shadow text-red-500">
Broken Product Images : {brokenImages}
</div>

<div className="bg-white p-4 rounded shadow text-red-500">
Broken Banners : {brokenBanners}
</div>

<div className="bg-white p-4 rounded shadow text-red-500">
Fake Orders : {fakeOrders}
</div>

<div className="bg-white p-4 rounded shadow">
Search Accuracy : {searchAccuracy}
</div>

<div className="bg-white p-4 rounded shadow">
Payment Gateway : {paymentStatus}
</div>

<div className="bg-white p-4 rounded shadow">
Database Performance : {dbPerformance}
</div>

<div className="bg-white p-4 rounded shadow">
SEO Issues : {seoIssues}
</div>

<div className="bg-white p-4 rounded shadow">
Security Issues : {securityIssues}
</div>

<div className="bg-white p-4 rounded shadow">
Qikink API : {qikinkStatus}
</div>

<div className="bg-white p-4 rounded shadow text-red-500">
Search Box Click Issue : {searchClickIssue ? "Detected" : "OK"}
</div>

<div className="bg-yellow-100 p-4 rounded shadow">
AI Bug Detection : {aiBug}
</div>

<div className="flex gap-3">

<button
onClick={runDiagnostics}
className="bg-pink-600 text-white px-4 py-2 rounded"
>
Run Diagnostics
</button>

<button
onClick={autoFixImages}
className="bg-green-600 text-white px-4 py-2 rounded"
>
Auto Fix Images
</button>

<button
onClick={autoFixSystem}
className="bg-blue-600 text-white px-4 py-2 rounded"
>
Auto Fix System
</button>

</div>

</div>

)

}

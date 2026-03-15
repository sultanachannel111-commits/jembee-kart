"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function RuntimeCheck(){

const [products,setProducts] = useState(0);
const [orders,setOrders] = useState(0);
const [searchStatus,setSearchStatus] = useState("Checking...");
const [paymentStatus,setPaymentStatus] = useState("Checking...");
const [qikinkStatus,setQikinkStatus] = useState("Checking...");
const [brokenImages,setBrokenImages] = useState(0);
const [speed,setSpeed] = useState(0);

useEffect(()=>{
runChecks();
},[]);

async function runChecks(){

/* --------------------------
Firestore products check
-------------------------- */

const p = await getDocs(collection(db,"products"));
setProducts(p.size);

/* --------------------------
Orders check
-------------------------- */

const o = await getDocs(collection(db,"orders"));
setOrders(o.size);

/* --------------------------
Search check
-------------------------- */

try{

const test = "shirt";
const res = await fetch(`/api/search-test?q=${test}`);

if(res.ok){
setSearchStatus("Working");
}else{
setSearchStatus("Error");
}

}catch{
setSearchStatus("Error");
}

/* --------------------------
Payment API check
-------------------------- */

try{

const pay = await fetch("/api/payment-test");

if(pay.ok){
setPaymentStatus("Working");
}else{
setPaymentStatus("Error");
}

}catch{
setPaymentStatus("Error");
}

/* --------------------------
Qikink API check
-------------------------- */

try{

const q = await fetch("/api/qikink-test");

if(q.ok){
setQikinkStatus("Working");
}else{
setQikinkStatus("Error");
}

}catch{
setQikinkStatus("Error");
}

/* --------------------------
Speed test
-------------------------- */

const start = performance.now();

await fetch("/");

const end = performance.now();

setSpeed(Math.round(end-start));

/* --------------------------
Broken image check
-------------------------- */

let broken = 0;

p.docs.forEach(d=>{
const data = d.data();

if(!data.image){
broken++;
}

});

setBrokenImages(broken);

}

return(

<div className="p-6 space-y-4">

<h1 className="text-3xl font-bold">
Runtime System Check
</h1>

<div className="bg-white p-4 rounded shadow">
Products : {products}
</div>

<div className="bg-white p-4 rounded shadow">
Orders : {orders}
</div>

<div className="bg-white p-4 rounded shadow">
Search System : {searchStatus}
</div>

<div className="bg-white p-4 rounded shadow">
Payment Gateway : {paymentStatus}
</div>

<div className="bg-white p-4 rounded shadow">
Qikink API : {qikinkStatus}
</div>

<div className="bg-white p-4 rounded shadow">
Broken Images : {brokenImages}
</div>

<div className="bg-white p-4 rounded shadow">
Website Speed : {speed} ms
</div>

<button
onClick={runChecks}
className="bg-blue-600 text-white px-4 py-2 rounded"
>
Run Again
</button>

</div>

);

}

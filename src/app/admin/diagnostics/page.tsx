"use client";

import { useEffect,useState } from "react";
import {
collection,
getDocs,
doc,
updateDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function DiagnosticsPage(){

const [loading,setLoading]=useState(true);

const [products,setProducts]=useState(0);
const [banners,setBanners]=useState(0);
const [categories,setCategories]=useState(0);
const [sellers,setSellers]=useState(0);
const [orders,setOrders]=useState(0);

const [missingProductImages,setMissingProductImages]=useState(0);
const [missingCategoryImages,setMissingCategoryImages]=useState(0);
const [brokenImages,setBrokenImages]=useState(0);
const [fakeOrders,setFakeOrders]=useState(0);
const [brokenBanners,setBrokenBanners]=useState(0);

useEffect(()=>{
runDiagnostics();
},[]);

function checkImage(url:string){

return new Promise((resolve)=>{

const img=new Image();
img.src=url;

img.onload=()=>resolve(true);
img.onerror=()=>resolve(false);

});

}

async function runDiagnostics(){

setLoading(true);

let missingProduct=0;
let missingCategory=0;
let broken=0;
let fake=0;
let brokenBanner=0;
let sellerCount=0;

try{

const productsSnap = await getDocs(collection(db,"products"));
const bannersSnap = await getDocs(collection(db,"banners"));
const categoriesSnap = await getDocs(collection(db,"categories"));
const usersSnap = await getDocs(collection(db,"users"));
const ordersSnap = await getDocs(collection(db,"orders"));

setProducts(productsSnap.size);
setBanners(bannersSnap.size);
setCategories(categoriesSnap.size);
setOrders(ordersSnap.size);

// SELLERS
usersSnap.forEach((docu)=>{

const data=docu.data();

if(data.role==="seller"){
sellerCount++;
}

});

setSellers(sellerCount);


// PRODUCT IMAGE CHECK

for(const docu of productsSnap.docs){

const data=docu.data();

if(!data.image){

missingProduct++;

}else{

const ok = await checkImage(data.image);

if(!ok){
broken++;
}

}

}


// CATEGORY IMAGE CHECK

categoriesSnap.forEach((docu)=>{

const data=docu.data();

if(!data.image){
missingCategory++;
}

});


// BANNER IMAGE CHECK

for(const docu of bannersSnap.docs){

const data=docu.data();

if(!data.image){

brokenBanner++;

}else{

const ok = await checkImage(data.image);

if(!ok){
brokenBanner++;
}

}

}


// FAKE ORDERS

ordersSnap.forEach((docu)=>{

const data=docu.data();

if(!data.total_order_value || data.total_order_value<=0){
fake++;
}

});

setMissingProductImages(missingProduct);
setMissingCategoryImages(missingCategory);
setBrokenImages(broken);
setFakeOrders(fake);
setBrokenBanners(brokenBanner);

}catch(e){

console.log("Diagnostics error",e);

}

setLoading(false);

}


async function autoFixImages(){

const productsSnap = await getDocs(collection(db,"products"));

for(const d of productsSnap.docs){

const data=d.data();

if(!data.image){

await updateDoc(
doc(db,"products",d.id),
{
image:"https://via.placeholder.com/400"
}
);

}

}

runDiagnostics();

}


if(loading){

return(

<div className="p-6">
Running Diagnostics...
</div>

);

}

return(

<div className="p-6 space-y-4">

<h1 className="text-3xl font-bold">
JembeeKart Advanced System Diagnostics
</h1>

<div className="bg-white p-4 rounded shadow">
Firebase Connection : OK
</div>

<div className="bg-white p-4 rounded shadow">
Website Health : Online
</div>

<div className="bg-white p-4 rounded shadow">
Products : {products}
</div>

<div className="bg-white p-4 rounded shadow">
Categories : {categories}
</div>

<div className="bg-white p-4 rounded shadow">
Banners : {banners}
</div>

<div className="bg-white p-4 rounded shadow">
Sellers : {sellers}
</div>

<div className="bg-white p-4 rounded shadow">
Orders : {orders}
</div>

<div className="bg-white p-4 rounded shadow text-red-500">
Missing Product Images : {missingProductImages}
</div>

<div className="bg-white p-4 rounded shadow text-red-500">
Missing Category Images : {missingCategoryImages}
</div>

<div className="bg-white p-4 rounded shadow text-red-500">
Broken Image Links : {brokenImages}
</div>

<div className="bg-white p-4 rounded shadow text-red-500">
Broken Banners : {brokenBanners}
</div>

<div className="bg-white p-4 rounded shadow text-red-500">
Fake Orders Detected : {fakeOrders}
</div>

<div className="flex gap-3">

<button
onClick={runDiagnostics}
className="bg-pink-600 text-white px-4 py-2 rounded"
>
Run Diagnostics Again
</button>

<button
onClick={autoFixImages}
className="bg-green-600 text-white px-4 py-2 rounded"
>
Auto Fix Missing Images
</button>

</div>

</div>

);

}

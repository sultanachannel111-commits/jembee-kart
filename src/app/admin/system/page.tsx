"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SystemMonitor() {

const [loading,setLoading] = useState(true);

const [data,setData] = useState({
products:0,
categories:0,
banners:0,
orders:0,
users:0,
sellers:0,
missingProductImages:0,
missingCategoryImages:0,
brokenImages:0,
fakeOrders:0,
inactiveBanners:0
});

useEffect(()=>{
runMonitor();
},[]);

async function runMonitor(){

setLoading(true);

const productSnap = await getDocs(collection(db,"products"));
const categorySnap = await getDocs(collection(db,"categories"));
const bannerSnap = await getDocs(collection(db,"banners"));
const orderSnap = await getDocs(collection(db,"orders"));
const userSnap = await getDocs(collection(db,"users"));

let missingProductImages = 0;
let missingCategoryImages = 0;
let brokenImages = 0;
let fakeOrders = 0;
let inactiveBanners = 0;
let sellers = 0;

/* PRODUCTS CHECK */

productSnap.docs.forEach(docu=>{

const d:any = docu.data();

if(!d.image){
missingProductImages++;
}else{

const img = new Image();
img.src = d.image;

img.onerror = ()=>{
brokenImages++;
};

}

});


/* CATEGORY IMAGE CHECK */

categorySnap.docs.forEach(docu=>{

const d:any = docu.data();

if(!d.image){
missingCategoryImages++;
}

});


/* BANNER CHECK */

bannerSnap.docs.forEach(docu=>{

const d:any = docu.data();

if(d.active===false){
inactiveBanners++;
}

});


/* USER CHECK */

userSnap.docs.forEach(docu=>{

const d:any = docu.data();

if(d.role==="seller"){
sellers++;
}

});


/* FAKE ORDER CHECK */

orderSnap.docs.forEach(docu=>{

const d:any = docu.data();

if(!d.total || d.total<=0){
fakeOrders++;
}

});


setData({

products:productSnap.size,
categories:categorySnap.size,
banners:bannerSnap.size,
orders:orderSnap.size,
users:userSnap.size,
sellers,
missingProductImages,
missingCategoryImages,
brokenImages,
fakeOrders,
inactiveBanners

});

setLoading(false);

}

if(loading){

return(
<div className="p-6">
Checking System Health...
</div>
);

}

return(

<div className="p-6 space-y-6">

<h1 className="text-3xl font-bold text-purple-600">
JembeeKart Full System Monitor
</h1>

<p className="text-gray-500">
Platform health overview
</p>


<div className="grid md:grid-cols-3 gap-6">


<div className="bg-white shadow p-5 rounded-xl">
<p className="text-sm text-gray-500">Products</p>
<p className="text-2xl font-bold">{data.products}</p>
</div>


<div className="bg-white shadow p-5 rounded-xl">
<p className="text-sm text-gray-500">Categories</p>
<p className="text-2xl font-bold">{data.categories}</p>
</div>


<div className="bg-white shadow p-5 rounded-xl">
<p className="text-sm text-gray-500">Banners</p>
<p className="text-2xl font-bold">{data.banners}</p>
</div>


<div className="bg-white shadow p-5 rounded-xl">
<p className="text-sm text-gray-500">Orders</p>
<p className="text-2xl font-bold">{data.orders}</p>
</div>


<div className="bg-white shadow p-5 rounded-xl">
<p className="text-sm text-gray-500">Users</p>
<p className="text-2xl font-bold">{data.users}</p>
</div>


<div className="bg-white shadow p-5 rounded-xl">
<p className="text-sm text-gray-500">Sellers</p>
<p className="text-2xl font-bold">{data.sellers}</p>
</div>


<div className="bg-white shadow p-5 rounded-xl text-red-600">
<p className="text-sm">Missing Product Images</p>
<p className="text-2xl font-bold">{data.missingProductImages}</p>
</div>


<div className="bg-white shadow p-5 rounded-xl text-red-600">
<p className="text-sm">Missing Category Images</p>
<p className="text-2xl font-bold">{data.missingCategoryImages}</p>
</div>


<div className="bg-white shadow p-5 rounded-xl text-red-600">
<p className="text-sm">Broken Images</p>
<p className="text-2xl font-bold">{data.brokenImages}</p>
</div>


<div className="bg-white shadow p-5 rounded-xl text-red-600">
<p className="text-sm">Fake Orders</p>
<p className="text-2xl font-bold">{data.fakeOrders}</p>
</div>


<div className="bg-white shadow p-5 rounded-xl text-red-600">
<p className="text-sm">Inactive Banners</p>
<p className="text-2xl font-bold">{data.inactiveBanners}</p>
</div>

</div>


<button
onClick={runMonitor}
className="bg-purple-600 text-white px-5 py-2 rounded"
>
Refresh Monitor
</button>


</div>

);

}

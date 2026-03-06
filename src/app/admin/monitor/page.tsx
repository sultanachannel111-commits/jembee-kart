"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SystemMonitor() {

const [loading,setLoading] = useState(true);

const [data,setData] = useState({
banners:0,
categories:0,
products:0,
missingProductImages:0,
missingCategoryImages:0
});

useEffect(()=>{

runCheck();

},[]);


async function runCheck(){

setLoading(true);

const bannerSnap = await getDocs(collection(db,"banners"));
const categorySnap = await getDocs(collection(db,"qikinkcategories"));
const productSnap = await getDocs(collection(db,"products"));

let missingProductImages = 0;
let missingCategoryImages = 0;


// PRODUCT IMAGE CHECK

productSnap.docs.forEach(docu=>{

const d:any = docu.data();

if(!d.image){
missingProductImages++;
}

});


// CATEGORY IMAGE CHECK

categorySnap.docs.forEach(docu=>{

const d:any = docu.data();

if(!d.image){
missingCategoryImages++;
}

});


setData({

banners:bannerSnap.size,
categories:categorySnap.size,
products:productSnap.size,
missingProductImages,
missingCategoryImages

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
JembeeKart System Monitor
</h1>

<p className="text-gray-500">
Live platform data overview
</p>


<div className="grid md:grid-cols-2 gap-6">


<div className="bg-white shadow rounded-xl p-5">
<p className="text-gray-500 text-sm">Total Banners</p>
<p className="text-2xl font-bold">{data.banners}</p>
</div>


<div className="bg-white shadow rounded-xl p-5">
<p className="text-gray-500 text-sm">Total Categories</p>
<p className="text-2xl font-bold">{data.categories}</p>
</div>


<div className="bg-white shadow rounded-xl p-5">
<p className="text-gray-500 text-sm">Total Products</p>
<p className="text-2xl font-bold">{data.products}</p>
</div>


<div className="bg-white shadow rounded-xl p-5 text-red-600">
<p className="text-gray-500 text-sm">Missing Product Images</p>
<p className="text-2xl font-bold">{data.missingProductImages}</p>
</div>


<div className="bg-white shadow rounded-xl p-5 text-red-600">
<p className="text-gray-500 text-sm">Missing Category Images</p>
<p className="text-2xl font-bold">{data.missingCategoryImages}</p>
</div>


</div>


<button
onClick={runCheck}
className="bg-purple-600 text-white px-5 py-2 rounded"
>
Refresh Monitor
</button>

</div>

);

}

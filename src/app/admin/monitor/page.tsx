"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SystemMonitor(){

const [data,setData] = useState({
banners:0,
categories:0,
products:0,
missingProductImages:0,
missingCategoryImages:0
});

useEffect(()=>{

const check = async()=>{

const bannerSnap = await getDocs(collection(db,"banners"));
const categorySnap = await getDocs(collection(db,"categories"));
const productSnap = await getDocs(collection(db,"products"));

let missingProductImages = 0;
let missingCategoryImages = 0;

productSnap.docs.forEach(doc=>{
const d:any = doc.data();
if(!d.image){
missingProductImages++;
}
});

categorySnap.docs.forEach(doc=>{
const d:any = doc.data();
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

};

check();

},[]);

return(

<div className="p-6"><h1 className="text-2xl font-bold mb-6">
JembeeKart System Monitor
</h1><div className="space-y-4"><div className="border p-4 rounded">
Banners: {data.banners}
</div><div className="border p-4 rounded">
Categories: {data.categories}
</div><div className="border p-4 rounded">
Products: {data.products}
</div><div className="border p-4 rounded text-red-500">
Missing Product Images: {data.missingProductImages}
</div><div className="border p-4 rounded text-red-500">
Missing Category Images: {data.missingCategoryImages}
</div></div></div>);

}

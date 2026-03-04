"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SystemCheck() {

const [report,setReport] = useState<any>({
banners:0,
festival:0,
categories:0,
products:0,
missingImages:0
});

useEffect(()=>{

const checkSystem = async()=>{

const banners = await getDocs(collection(db,"banners"));
const festival = await getDocs(collection(db,"festival"));
const categories = await getDocs(collection(db,"categories"));
const products = await getDocs(collection(db,"products"));

let missingImages = 0;

products.docs.forEach(doc=>{
const data:any = doc.data();
if(!data.image){
missingImages++;
}
});

setReport({
banners:banners.size,
festival:festival.size,
categories:categories.size,
products:products.size,
missingImages
});

};

checkSystem();

},[]);

return(

<div className="p-6">

<h1 className="text-2xl font-bold mb-6">
System Diagnostics
</h1>

<div className="space-y-4">

<div className="p-4 border rounded">
Banner Count: {report.banners}
</div>

<div className="p-4 border rounded">
Festival Banner Count: {report.festival}
</div>

<div className="p-4 border rounded">
Categories: {report.categories}
</div>

<div className="p-4 border rounded">
Products: {report.products}
</div>

<div className="p-4 border rounded text-red-500">
Missing Product Images: {report.missingImages}
</div>

</div>

</div>

);

}

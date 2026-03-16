"use client";

import { useState, useEffect } from "react";

export default function ImageGallery(){

const [origin,setOrigin] = useState("");

useEffect(()=>{
setOrigin(window.location.origin);
},[]);

const images = [
"/banner.png",
"/shoes.png",
"/tshirt.png"
];

function copyLink(img:string){

const link = origin + img;

navigator.clipboard.writeText(link);

alert("Image link copied");

}

return(

<div className="p-10">

<h1 className="text-3xl font-bold mb-8">
Image Gallery
</h1>

<div className="grid grid-cols-2 md:grid-cols-4 gap-6">

{images.map((img,index)=>{

const link = origin + img;

return(

<div
key={index}
className="bg-white p-4 rounded shadow cursor-pointer"
onClick={()=>copyLink(img)}
>

<img
src={img}
className="w-full h-40 object-cover rounded"
/>

<p className="text-xs mt-2 break-all">
{link}
</p>

</div>

);

})}

</div>

</div>

);

}

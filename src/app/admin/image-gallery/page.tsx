"use client";

import { useState } from "react";

export default function ImageGallery(){

const [copied,setCopied] = useState("");

const images = [

"/banner.png",
"/shoes.png",
"/tshirt.png"

];

function copyLink(img:string){

const link = window.location.origin + img;

navigator.clipboard.writeText(link);

setCopied(link);

alert("Image link copied");

}

return(

<div className="p-10">

<h1 className="text-3xl font-bold mb-8">
Image Gallery
</h1>

<div className="grid grid-cols-2 md:grid-cols-4 gap-6">

{images.map((img,index)=>(

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
{window.location.origin + img}
</p>

</div>

))}

</div>

</div>

);

}

"use client";

import { useState } from "react";

export default function ImageSlider({product}:any){

const images = [
product.image,
product.frontImage,
product.backImage,
product.sideImage,
product.modelImage
].filter(Boolean);

const [active,setActive] = useState(0);

return(

<div className="space-y-3">

<img
src={images[active]}
className="w-full rounded-xl"
/>

<div className="flex gap-2 overflow-x-auto">

{images.map((img:any,i:number)=>(
<img
key={i}
src={img}
onClick={()=>setActive(i)}
className={`w-16 h-16 rounded border cursor-pointer ${
active===i ? "border-pink-500" : ""
}`}
/>
))}

</div>

</div>

);

}

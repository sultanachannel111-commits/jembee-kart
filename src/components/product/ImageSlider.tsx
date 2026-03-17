"use client";

import { useState, useEffect, useRef } from "react";

export default function ImageSlider({ product }: any){

const images = [
product.image,
product.frontImage,
product.backImage,
product.sideImage,
product.modelImage
].filter(Boolean);

const [active,setActive] = useState(0);
const [zoom,setZoom] = useState(false);
const [position,setPosition] = useState({x:50,y:50});

const imgRef = useRef<HTMLImageElement>(null);

/* AUTO SLIDE */

useEffect(()=>{

const interval = setInterval(()=>{

setActive(prev =>
prev === images.length-1 ? 0 : prev + 1
);

},4000);

return ()=>clearInterval(interval);

},[images.length]);

/* 3D ZOOM MOVE */

const handleMove = (e:any)=>{

const rect = imgRef.current?.getBoundingClientRect();

if(!rect) return;

const x = ((e.clientX - rect.left) / rect.width) * 100;
const y = ((e.clientY - rect.top) / rect.height) * 100;

setPosition({x,y});

};

/* TOUCH MOVE */

const handleTouchMove = (e:any)=>{

const rect = imgRef.current?.getBoundingClientRect();

if(!rect) return;

const touch = e.touches[0];

const x = ((touch.clientX - rect.left) / rect.width) * 100;
const y = ((touch.clientY - rect.top) / rect.height) * 100;

setPosition({x,y});

};

/* SWIPE */

let startX = 0;

const touchStart = (e:any)=>{
startX = e.touches[0].clientX;
};

const touchEnd = (e:any)=>{

const endX = e.changedTouches[0].clientX;

if(startX - endX > 50){
setActive(active === images.length-1 ? 0 : active+1);
}

if(endX - startX > 50){
setActive(active === 0 ? images.length-1 : active-1);
}

};

return(

<div className="space-y-3">

{/* MAIN IMAGE */}

<div
className="overflow-hidden rounded-xl"
onTouchStart={touchStart}
onTouchEnd={touchEnd}
>

<img
ref={imgRef}
src={images[active]}
onMouseMove={handleMove}
onTouchMove={handleTouchMove}
onClick={()=>setZoom(true)}
style={{
transform:"scale(1.8)",
transformOrigin:`${position.x}% ${position.y}%`
}}
className="w-full cursor-zoom-in transition-transform duration-200"
/>

</div>

{/* THUMBNAILS */}

<div className="flex gap-2 overflow-x-auto">

{images.map((img:any,i:number)=>(
<img
key={i}
src={img}
onClick={()=>setActive(i)}
className={`w-16 h-16 rounded border cursor-pointer
${active===i ? "border-pink-500" : "border-gray-300"}
`}
/>
))}

</div>

{/* FULLSCREEN */}

{zoom && (

<div
className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
onClick={()=>setZoom(false)}
>

<img
src={images[active]}
className="max-w-[95%] max-h-[95%] object-contain rounded-xl"
/>

</div>

)}

</div>

);

}

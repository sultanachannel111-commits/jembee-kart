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
const [touching,setTouching] = useState(false);
const [position,setPosition] = useState({x:50,y:50});
const [scale,setScale] = useState(1);

const imgRef = useRef<HTMLImageElement>(null);

/* AUTO SLIDE */

useEffect(()=>{

if(zoom || touching) return;

const interval = setInterval(()=>{
setActive(prev => prev === images.length-1 ? 0 : prev+1);
},4000);

return ()=>clearInterval(interval);

},[images.length,zoom,touching]);

/* MOUSE MOVE ZOOM */

const handleMove = (e:any)=>{

const rect = imgRef.current?.getBoundingClientRect();
if(!rect) return;

const x = ((e.clientX - rect.left)/rect.width)*100;
const y = ((e.clientY - rect.top)/rect.height)*100;

setPosition({x,y});

};

/* TOUCH MOVE + PINCH */

let startX = 0;
let initialDistance = 0;

const getDistance = (touches:any)=>{
const dx = touches[0].clientX - touches[1].clientX;
const dy = touches[0].clientY - touches[1].clientY;
return Math.sqrt(dx*dx + dy*dy);
};

const touchStart = (e:any)=>{
setTouching(true);

if(e.touches.length === 2){
initialDistance = getDistance(e.touches);
}

startX = e.touches[0].clientX;
};

const touchMove = (e:any)=>{

const rect = imgRef.current?.getBoundingClientRect();
if(!rect) return;

// single finger move
if(e.touches.length === 1){
const touch = e.touches[0];

const x = ((touch.clientX - rect.left)/rect.width)*100;
const y = ((touch.clientY - rect.top)/rect.height)*100;

setPosition({x,y});
}

// pinch zoom
if(e.touches.length === 2){
const distance = getDistance(e.touches);
const zoomFactor = distance / initialDistance;
setScale(Math.min(Math.max(zoomFactor,1),3)); // limit zoom
}

};

const touchEnd = (e:any)=>{

setTouching(false);
setScale(1);

const endX = e.changedTouches[0].clientX;

// swipe
if(startX - endX > 50){
setActive(active === images.length-1 ? 0 : active+1);
}

if(endX - startX > 50){
setActive(active === 0 ? images.length-1 : active-1);
}

};

/* ARROWS */

const next = ()=>{
setActive(active === images.length-1 ? 0 : active+1);
};

const prev = ()=>{
setActive(active === 0 ? images.length-1 : active-1);
};

return(

<div className="space-y-3">

{/* MAIN IMAGE */}

<div
className="relative overflow-hidden rounded-xl"
onTouchStart={touchStart}
onTouchMove={touchMove}
onTouchEnd={touchEnd}
>

<img
ref={imgRef}
src={images[active]}
onMouseMove={handleMove}
onClick={()=>setZoom(true)}
style={{
transform:`scale(${1.5 * scale})`,
transformOrigin:`${position.x}% ${position.y}%`,
transition:"transform 0.3s ease"
}}
className="w-full cursor-zoom-in"
/>

{/* LEFT ARROW */}

<button
onClick={prev}
className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full"
>
‹
</button>

{/* RIGHT ARROW */}

<button
onClick={next}
className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full"
>
›
</button>

{/* MAGNIFIER GLASS */}

<div
className="hidden md:block absolute w-32 h-32 border rounded-full pointer-events-none"
style={{
top:`${position.y}%`,
left:`${position.x}%`,
transform:"translate(-50%,-50%)"
}}
/>

</div>

{/* THUMBNAILS */}

<div className="flex gap-2 overflow-x-auto">

{images.map((img:any,i:number)=>(
<img
key={i}
src={img}
onClick={()=>setActive(i)}
className={`w-16 h-16 rounded border cursor-pointer transition
${active===i ? "border-pink-500 scale-105" : "border-gray-300"}
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

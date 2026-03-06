"use client";

export default function BannerSlider({
banners,
slide
}: any){

if(!banners.length) return null;

return(

<div className="mt-2">

<img
src={banners[slide]?.image}
className="w-full h-[160px] object-cover rounded-xl"
/>

</div>

);

}

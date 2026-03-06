"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";

export default function ProductGrid({products}:any){

return(

<div className="grid grid-cols-2 gap-4">

{products.map((product:any)=>(

<div
key={product.id}
className="bg-white rounded-xl shadow p-3 relative"
>

<Heart
size={18}
className="absolute top-2 right-2 text-gray-400"
/>

<Link href={`/product/${product.id}`}>

<img
src={product.image}
className="w-full h-40 object-cover rounded-lg"
/>

</Link>

{product.discount && (

<span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-1 rounded">

{product.discount}% OFF

</span>

)}

<div className="mt-2 text-sm truncate">
{product.name}
</div>

<div className="flex items-center gap-1 text-xs mt-1">

<Star size={12} className="text-yellow-500 fill-yellow-500"/>
<span>{product.rating || "4.5"}</span>

</div>

<div className="flex items-center gap-2 mt-1">

<span className="font-bold">₹{product.price}</span>

{product.originalPrice && (

<span className="line-through text-gray-400 text-xs">

₹{product.originalPrice}

</span>

)}

</div>

</div>

))}

</div>

);

}

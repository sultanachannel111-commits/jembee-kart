"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function OffersPage(){

const [products,setProducts] = useState<any[]>([]);

useEffect(()=>{

const fetchData = async()=>{

const productSnap = await getDocs(collection(db,"products"));
const offerSnap = await getDocs(collection(db,"offers"));

const allProducts = productSnap.docs.map(d=>({
id:d.id,
...d.data()
}));

const activeOffers = offerSnap.docs
.map(d=>({id:d.id,...d.data()}))
.filter(
(o:any)=>
o.active &&
new Date(o.endDate).getTime()>Date.now()
);

const result = allProducts.map((product:any)=>{

const basePrice = Number(product.sellPrice || product.price || 0);

let matchedOffer = activeOffers.find((o:any)=>{

if(o.type==="product" && o.productId===product.id)
return true;

if(o.type==="category" && o.category===product.category)
return true;

return false;

});

if(!matchedOffer) return null;

const discount = Number(matchedOffer.discount);

const finalPrice = Math.round(
basePrice - (basePrice * discount)/100
);

return{
...product,
discount,
finalPrice,
basePrice
};

}).filter(Boolean);

setProducts(result);

};

fetchData();

},[]);

return(

<div className="p-4 pt-[96px]">

<h1 className="text-2xl font-bold mb-4">
🔥 Hot Offers
</h1>

<div className="grid grid-cols-2 gap-4">

{products.map((p:any)=>(

<Link
key={p.id}
href={`/product/${p.id}`}
className="bg-white rounded-xl shadow p-2 relative"
>

<span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
{p.discount}% OFF
</span>

<img
src={p.image}
className="w-full h-40 object-cover rounded"
/>

<div className="mt-2 text-sm font-medium truncate">
{p.name}
</div>

<div className="flex gap-2 items-center mt-1">

<span className="font-bold text-red-600">
₹{p.finalPrice}
</span>

<span className="text-gray-400 line-through text-xs">
₹{p.basePrice}
</span>

</div>

</Link>

))}

</div>

</div>

);

}

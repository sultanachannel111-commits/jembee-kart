"use client";

export default function LightningDeals({products}:any){

if(!products.length) return null;

return(

<div>

<h2 className="font-bold text-lg mb-2">
⚡ Lightning Deals
</h2>

<div className="grid grid-cols-2 gap-3">

{products.map((p:any)=>(

<div key={p.id} className="border rounded p-2">

<img src={p.image} className="w-full h-32 object-cover"/>

<p className="text-sm mt-1">
{p.name}
</p>

<p className="font-bold text-pink-600">
₹{p.price}
</p>

</div>

))}

</div>

</div>

);

}

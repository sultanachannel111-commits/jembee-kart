"use client";

import { useEffect,useState } from "react";
import { useParams } from "next/navigation";
import { doc,getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function TrackOrder(){

const {id} = useParams();

const [order,setOrder] = useState<any>(null);

useEffect(()=>{

const fetchOrder = async()=>{

const snap = await getDoc(doc(db,"orders",id as string));

if(snap.exists()){

setOrder(snap.data());

}

};

fetchOrder();

},[id]);


if(!order){

return(

<div className="min-h-screen flex items-center justify-center">

Loading...

</div>

);

}


/* ========================
PROGRESS BAR
======================== */

let progress = 25;

if(order.status==="Processing") progress=50;
if(order.status==="Shipped") progress=75;
if(order.status==="Delivered") progress=100;


return(

<div className="min-h-screen p-6 max-w-xl mx-auto">

<h1 className="text-2xl font-bold mb-6">

Track Your Order

</h1>

<div className="bg-white p-6 rounded-xl shadow">

<p className="font-semibold">
Order ID
</p>

<p className="mb-4">
{id}
</p>


<p className="font-semibold">
Product
</p>

<p className="mb-4">
{order.productName || order.product?.name}
</p>


<p className="font-semibold">
Status
</p>

<p className="mb-4 text-purple-600 font-bold">
{order.status}
</p>


{/* PROGRESS BAR */}

<div className="w-full bg-gray-200 h-4 rounded-full mb-6">

<div
className="bg-green-500 h-4 rounded-full"
style={{width:progress+"%"}}
/>

</div>


{/* TRACKING INFO */}

{order.trackingId && (

<div className="mb-4">

<p className="font-semibold">
Tracking ID
</p>

<p>
{order.trackingId}
</p>

</div>

)}


{order.courier && (

<div className="mb-4">

<p className="font-semibold">
Courier
</p>

<p>
{order.courier}
</p>

</div>

)}


{order.estimatedDelivery && (

<div className="mb-4">

<p className="font-semibold">
Estimated Delivery
</p>

<p>
{order.estimatedDelivery}
</p>

</div>

)}


{/* COURIER TRACKING LINK */}

{order.trackingId && (

<a
href={`https://www.google.com/search?q=${order.courier}+tracking+${order.trackingId}`}
target="_blank"
className="text-blue-600 underline"
>

Track Shipment

</a>

)}

</div>

</div>

);

}

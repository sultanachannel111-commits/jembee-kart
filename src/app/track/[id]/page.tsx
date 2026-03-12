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

{order.productName}

</p>

<p className="font-semibold">

Status

</p>

<p className="mb-4 text-purple-600 font-bold">

{order.status}

</p>

{order.trackingId && (

<div>

<p className="font-semibold">

Tracking ID

</p>

<p>

{order.trackingId}

</p>

</div>

)}

</div>

</div>

);

}

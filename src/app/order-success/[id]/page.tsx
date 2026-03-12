"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";

export default function OrderSuccess(){

const { id } = useParams();
const [order,setOrder] = useState<any>(null);

useEffect(()=>{

const saveOrder = async()=>{

const auth = getAuth();
const user = auth.currentUser;

if(!user) return;

const productName = localStorage.getItem("productName");
const price = localStorage.getItem("price");

const ref = doc(db,"orders",id as string);

const snap = await getDoc(ref);

if(!snap.exists()){

await setDoc(ref,{

userId:user.uid,
productName:productName || "Product",
price:price || 0,

status:"Pending",

trackingId:null,
qikinkOrderId:null,

createdAt:serverTimestamp()

});

}

const newSnap = await getDoc(ref);
setOrder(newSnap.data());

};

saveOrder();

},[id]);

if(!order){

return(
<div className="min-h-screen flex items-center justify-center">
Loading...
</div>
);

}

return(

<div className="p-6 pt-[100px]">

<h1 className="text-green-600 text-2xl font-bold">
Payment Successful 🎉
</h1>

<p>Order ID: {id}</p>

<p>Product: {order.productName}</p>

<p>Total: ₹{order.price}</p>

<p>Status: {order.status}</p>

</div>

);

  }q

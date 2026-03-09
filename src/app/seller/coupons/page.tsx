"use client";

import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
collection,
addDoc,
serverTimestamp
} from "firebase/firestore";

export default function SellerCoupons(){

const [code,setCode] = useState("");
const [discount,setDiscount] = useState("");
const [minOrder,setMinOrder] = useState("");
const [expiry,setExpiry] = useState("");
const [loading,setLoading] = useState(false);

const createCoupon = async(e:any)=>{

e.preventDefault();

setLoading(true);

try{

const user = auth.currentUser;

if(!user){
alert("Login required");
return;
}

await addDoc(
collection(db,"coupons"),
{
sellerId:user.uid,
code:code.toUpperCase(),
discount:Number(discount),
minOrder:Number(minOrder),
expiry:expiry,
createdAt:serverTimestamp()
}
);

alert("Coupon Created");

setCode("");
setDiscount("");
setMinOrder("");
setExpiry("");

}catch(err){

console.log(err);
alert("Coupon creation failed");

}

setLoading(false);

};

return(

<div className="max-w-xl">

<h1 className="text-2xl font-bold mb-6">
Create Coupon
</h1>

<form onSubmit={createCoupon} className="space-y-4">

<input
placeholder="Coupon Code"
value={code}
onChange={(e)=>setCode(e.target.value)}
className="border p-3 w-full rounded"
/>

<input
placeholder="Discount %"
value={discount}
onChange={(e)=>setDiscount(e.target.value)}
className="border p-3 w-full rounded"
/>

<input
placeholder="Minimum Order Amount"
value={minOrder}
onChange={(e)=>setMinOrder(e.target.value)}
className="border p-3 w-full rounded"
/>

<input
type="date"
value={expiry}
onChange={(e)=>setExpiry(e.target.value)}
className="border p-3 w-full rounded"
/>

<button
type="submit"
className="bg-black text-white px-5 py-3 rounded"
>

{loading ? "Creating..." : "Create Coupon"}

</button>

</form>

</div>

);

}

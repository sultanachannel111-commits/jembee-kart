"use client";

import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function SellerWithdraw(){

const [amount,setAmount] = useState("");
const [upi,setUpi] = useState("");
const [loading,setLoading] = useState(false);

const requestWithdraw = async(e:any)=>{

e.preventDefault();

setLoading(true);

try{

const user = auth.currentUser;

if(!user){
alert("Login required");
return;
}

await addDoc(
collection(db,"withdrawRequests"),
{
sellerId:user.uid,
amount:Number(amount),
upi:upi,
status:"pending",
createdAt:serverTimestamp()
}
);

alert("Withdraw request submitted");

setAmount("");
setUpi("");

}catch(err){

console.log(err);
alert("Withdraw failed");

}

setLoading(false);

};

return(

<div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">

<h1 className="text-2xl font-bold mb-6">
Withdraw Earnings
</h1>

<form onSubmit={requestWithdraw} className="space-y-4">

<input
placeholder="Amount"
value={amount}
onChange={(e)=>setAmount(e.target.value)}
className="border w-full p-2 rounded"
/>

<input
placeholder="UPI ID"
value={upi}
onChange={(e)=>setUpi(e.target.value)}
className="border w-full p-2 rounded"
/>

<button
type="submit"
className="bg-black text-white w-full p-2 rounded"
>

{loading ? "Submitting..." : "Request Withdraw"}

</button>

</form>

</div>

);

}

"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SellerKYC(){

const [name,setName] = useState("");
const [phone,setPhone] = useState("");
const [aadhaar,setAadhaar] = useState("");
const [pan,setPan] = useState("");

const [accountHolder,setAccountHolder] = useState("");
const [accountNumber,setAccountNumber] = useState("");
const [ifsc,setIfsc] = useState("");
const [bankName,setBankName] = useState("");

const [shopName,setShopName] = useState("");
const [address,setAddress] = useState("");

const submitKYC = async ()=>{

const user = auth.currentUser;

if(!user){
alert("Please login first");
return;
}

await setDoc(
doc(db,"sellerKYC",user.uid),
{

uid:user.uid,
email:user.email,

name,
phone,

aadhaarNumber:aadhaar,
panNumber:pan,

accountHolder,
accountNumber,
ifsc,
bankName,

shopName,
address,

status:"pending",

createdAt:serverTimestamp()

}
);

alert("KYC submitted successfully");

};

return(

<div className="max-w-md mx-auto p-4 space-y-3">

<h1 className="text-2xl font-bold">
Seller KYC Verification
</h1>

<input
placeholder="Full Name"
className="border p-2 w-full"
value={name}
onChange={(e)=>setName(e.target.value)}
/>

<input
placeholder="Phone Number"
className="border p-2 w-full"
value={phone}
onChange={(e)=>setPhone(e.target.value)}
/>

<input
placeholder="Aadhaar Number"
className="border p-2 w-full"
value={aadhaar}
onChange={(e)=>setAadhaar(e.target.value)}
/>

<input
placeholder="PAN Number"
className="border p-2 w-full"
value={pan}
onChange={(e)=>setPan(e.target.value)}
/>

<input
placeholder="Account Holder Name"
className="border p-2 w-full"
value={accountHolder}
onChange={(e)=>setAccountHolder(e.target.value)}
/>

<input
placeholder="Bank Account Number"
className="border p-2 w-full"
value={accountNumber}
onChange={(e)=>setAccountNumber(e.target.value)}
/>

<input
placeholder="IFSC Code"
className="border p-2 w-full"
value={ifsc}
onChange={(e)=>setIfsc(e.target.value)}
/>

<input
placeholder="Bank Name"
className="border p-2 w-full"
value={bankName}
onChange={(e)=>setBankName(e.target.value)}
/>

<input
placeholder="Shop Name"
className="border p-2 w-full"
value={shopName}
onChange={(e)=>setShopName(e.target.value)}
/>

<textarea
placeholder="Shop Address"
className="border p-2 w-full"
value={address}
onChange={(e)=>setAddress(e.target.value)}
/>

<button
onClick={submitKYC}
className="bg-black text-white w-full py-2 rounded"
>

Submit KYC

</button>

</div>

)

}

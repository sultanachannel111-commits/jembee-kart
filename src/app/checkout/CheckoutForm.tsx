"use client";

import { useState,useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { load } from "@cashfreepayments/cashfree-js";
import { doc,getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CheckoutForm(){

const searchParams = useSearchParams();
const productId = searchParams.get("productId");

const [product,setProduct] = useState<any>(null);
const [loading,setLoading] = useState(false);

const [customer,setCustomer] = useState({
firstName:"",
lastName:"",
address:"",
city:"",
state:"",
zip:"",
phone:"",
email:""
});

/* =========================
FETCH PRODUCT
========================= */

useEffect(()=>{

const fetchProduct = async()=>{

if(!productId) return;

const snap = await getDoc(doc(db,"products",productId));

if(snap.exists()){
setProduct({id:snap.id,...snap.data()});
}

};

fetchProduct();

},[productId]);

/* =========================
PINCODE → CITY AUTO
========================= */

const handlePincode = async(pincode:string)=>{

setCustomer({...customer,zip:pincode});

if(pincode.length === 6){

try{

const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
const data = await res.json();

if(data[0].Status === "Success"){

const office = data[0].PostOffice[0];

setCustomer(prev=>({
...prev,
city:office.District,
state:office.State
}));

}

}catch(err){
console.log(err);
}

}

};

/* =========================
PAYMENT
========================= */

const placeOrder = async()=>{

if(!customer.phone){
alert("Enter phone number");
return;
}

if(!product){
alert("Product not loaded");
return;
}

setLoading(true);

try{

const res = await fetch("/api/cashfree/create-order",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
amount:product.sellPrice || product.price,
customer
})
});

const data = await res.json();

setLoading(false);

if(!data.payment_session_id){
alert("Payment initialization failed");
return;
}

const cashfree = await load({
mode:"production"
});

cashfree.checkout({
paymentSessionId:data.payment_session_id,
redirectTarget:"_self"
});

}catch(err){

setLoading(false);
alert("Server error");

}

};

/* =========================
UI
========================= */

if(!product){
return(
<div className="p-10 text-center">
Loading product...
</div>
);
}

return(

<div className="p-6 max-w-xl mx-auto">

<h1 className="text-2xl font-bold mb-6">
Checkout
</h1>

{/* PRODUCT INFO */}

<div className="bg-white p-4 rounded-xl shadow mb-6">

<h2 className="font-semibold">
{product.name}
</h2>

<p className="text-pink-600 font-bold text-xl">
₹{product.sellPrice || product.price}
</p>

</div>

<div className="space-y-4">

<input
placeholder="First Name"
className="border p-3 w-full rounded"
onChange={(e)=>setCustomer({...customer,firstName:e.target.value})}
/>

<input
placeholder="Last Name"
className="border p-3 w-full rounded"
onChange={(e)=>setCustomer({...customer,lastName:e.target.value})}
/>

<textarea
placeholder="Full Address"
className="border p-3 w-full rounded"
onChange={(e)=>setCustomer({...customer,address:e.target.value})}
/>

<input
placeholder="Pin Code"
className="border p-3 w-full rounded"
onChange={(e)=>handlePincode(e.target.value)}
/>

<input
placeholder="City"
value={customer.city}
className="border p-3 w-full rounded"
onChange={(e)=>setCustomer({...customer,city:e.target.value})}
/>

<input
placeholder="State"
value={customer.state}
className="border p-3 w-full rounded"
onChange={(e)=>setCustomer({...customer,state:e.target.value})}
/>

<input
placeholder="Phone Number"
className="border p-3 w-full rounded"
onChange={(e)=>setCustomer({...customer,phone:e.target.value})}
/>

<input
placeholder="Email Address"
className="border p-3 w-full rounded"
onChange={(e)=>setCustomer({...customer,email:e.target.value})}
/>

<button
onClick={placeOrder}
className="bg-pink-500 text-white px-6 py-3 rounded w-full"
>

{loading ? "Processing Payment..." : `Pay ₹${product.sellPrice || product.price}`}

</button>

</div>

</div>

);

}

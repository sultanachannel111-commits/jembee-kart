"use client";

import { useEffect, useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import { auth, db } from "@/lib/firebase";

import {
collection,
getDocs,
addDoc,
serverTimestamp
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

export default function CheckoutPage(){

const [items,setItems] = useState<any[]>([]);
const [user,setUser] = useState<any>(null);
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

/* =====================
LOAD CART
===================== */

useEffect(()=>{

const unsub = onAuthStateChanged(auth,async(u)=>{

if(!u) return;

setUser(u);

const snap = await getDocs(
collection(db,"cart",u.uid,"items")
);

const data:any[] = [];

snap.forEach(doc=>{
data.push({
id:doc.id,
...doc.data()
});
});

setItems(data);

});

return ()=>unsub();

},[]);


/* =====================
TOTAL PRICE
===================== */

const total = items.reduce(
(sum,i)=> sum + (i.price * (i.quantity || 1)),
0
);


/* =====================
VALIDATION
===================== */

const validateCustomer = ()=>{

if(!customer.firstName){
alert("Enter First Name");
return false;
}

if(!customer.address){
alert("Enter Address");
return false;
}

if(!customer.city){
alert("Enter City");
return false;
}

if(!customer.state){
alert("Enter State");
return false;
}

if(!customer.zip){
alert("Enter Pincode");
return false;
}

if(!customer.phone || customer.phone.length !== 10){
alert("Enter valid phone number");
return false;
}

if(!customer.email){
alert("Enter Email");
return false;
}

return true;

};


/* =====================
PLACE ORDER
===================== */

const placeOrder = async()=>{

if(!validateCustomer()) return;

if(items.length === 0){
alert("Cart empty");
return;
}

setLoading(true);

try{

/* SAVE ORDER */

const orderRef = await addDoc(
collection(db,"orders"),
{
userId:user.uid,

items:items,

total:total,

customer:customer,

status:"pending",

createdAt:serverTimestamp()
}
);


/* CREATE PAYMENT */

const res = await fetch("/api/cashfree/create-order",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

orderId:orderRef.id,

amount:total,

items,

customer

})

});

const data = await res.json();

setLoading(false);

if(!data.payment_session_id){
alert("Payment initialization failed");
return;
}

/* CASHFREE */

const cashfree = await load({
mode:"production"
});

cashfree.checkout({

paymentSessionId:data.payment_session_id,

redirectTarget:"_self"

});

}catch(err){

console.log(err);

setLoading(false);

alert("Server error");

}

};



/* =====================
UI
===================== */

return(

<div className="p-6 max-w-xl mx-auto">

<h1 className="text-2xl font-bold mb-6">
Checkout
</h1>


{/* PRODUCTS */}

<div className="space-y-4 mb-6">

{items.map(item=>(

<div
key={item.id}
className="bg-white p-4 rounded-xl shadow flex gap-4"
>

<img
src={item.image}
className="w-20 h-20 object-cover rounded"
/>

<div className="flex-1">

<p className="font-semibold">
{item.name}
</p>

<p className="text-pink-600 font-bold">
₹{item.price}
</p>

<p className="text-sm text-gray-500">
Qty : {item.quantity}
</p>

</div>

</div>

))}

</div>


{/* TOTAL */}

<div className="text-xl font-bold mb-6">
Total : ₹{total}
</div>


{/* CUSTOMER FORM */}

<div className="space-y-4">

<input
placeholder="First Name"
className="border p-3 w-full rounded"
value={customer.firstName}
onChange={(e)=>
setCustomer({...customer,firstName:e.target.value})
}
/>

<input
placeholder="Last Name"
className="border p-3 w-full rounded"
value={customer.lastName}
onChange={(e)=>
setCustomer({...customer,lastName:e.target.value})
}
/>

<textarea
placeholder="Full Address"
className="border p-3 w-full rounded"
value={customer.address}
onChange={(e)=>
setCustomer({...customer,address:e.target.value})
}
/>

<input
placeholder="City"
className="border p-3 w-full rounded"
value={customer.city}
onChange={(e)=>
setCustomer({...customer,city:e.target.value})
}
/>

<input
placeholder="State"
className="border p-3 w-full rounded"
value={customer.state}
onChange={(e)=>
setCustomer({...customer,state:e.target.value})
}
/>

<input
placeholder="Pin Code"
className="border p-3 w-full rounded"
value={customer.zip}
onChange={(e)=>
setCustomer({...customer,zip:e.target.value})
}
/>

<input
placeholder="Phone Number"
className="border p-3 w-full rounded"
value={customer.phone}
onChange={(e)=>
setCustomer({...customer,phone:e.target.value})
}
/>

<input
placeholder="Email Address"
className="border p-3 w-full rounded"
value={customer.email}
onChange={(e)=>
setCustomer({...customer,email:e.target.value})
}
/>


{/* PAY BUTTON */}

<button
onClick={placeOrder}
className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded w-full"
>

{loading
? "Processing Payment..."
: `Pay ₹${total}`
}

</button>

</div>

</div>

);

}

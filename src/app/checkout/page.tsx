"use client";

import { useState } from "react";

export default function CheckoutPage() {

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
INDIA STATES
========================= */

const states = [
"Andhra Pradesh",
"Arunachal Pradesh",
"Assam",
"Bihar",
"Chhattisgarh",
"Goa",
"Gujarat",
"Haryana",
"Himachal Pradesh",
"Jharkhand",
"Karnataka",
"Kerala",
"Madhya Pradesh",
"Maharashtra",
"Manipur",
"Meghalaya",
"Mizoram",
"Nagaland",
"Odisha",
"Punjab",
"Rajasthan",
"Sikkim",
"Tamil Nadu",
"Telangana",
"Tripura",
"Uttar Pradesh",
"Uttarakhand",
"West Bengal",
"Andaman and Nicobar Islands",
"Chandigarh",
"Dadra and Nagar Haveli and Daman and Diu",
"Delhi",
"Jammu and Kashmir",
"Ladakh",
"Lakshadweep",
"Puducherry"
];

/* =========================
PINCODE → CITY AUTO
========================= */

const handlePincode = async(pincode:string)=>{

setCustomer({...customer,zip:pincode});

if(pincode.length === 6){

try{

const res = await fetch(
`https://api.postalpincode.in/pincode/${pincode}`
);

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
PRODUCT
========================= */

const product = {
name:"Custom T-shirt",
sku:"TSHIRT001",
printTypeId:"1",
sellingPrice:499,
designLink:"https://example.com/design.png",
mockupLink:"https://example.com/mockup.png"
};

/* =========================
PLACE ORDER
========================= */

const placeOrder = async()=>{

setLoading(true);

const res = await fetch("/api/orders/create",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
product,
customer,
paymentMethod:"ONLINE"
})
});

const data = await res.json();

setLoading(false);

if(data.success){

alert("Order placed successfully");

}else{

alert("Order failed");

}

};

return(

<div className="p-6 max-w-xl mx-auto">

<h1 className="text-2xl font-bold mb-6">
Checkout
</h1>

<div className="space-y-4">

<input
placeholder="First Name"
className="border p-3 w-full rounded"
onChange={(e)=>
setCustomer({...customer,firstName:e.target.value})
}
/>

<input
placeholder="Last Name"
className="border p-3 w-full rounded"
onChange={(e)=>
setCustomer({...customer,lastName:e.target.value})
}
/>

<textarea
placeholder="Full Address"
className="border p-3 w-full rounded"
onChange={(e)=>
setCustomer({...customer,address:e.target.value})
}
/>

{/* PINCODE */}

<input
placeholder="Pin Code"
className="border p-3 w-full rounded"
onChange={(e)=>handlePincode(e.target.value)}
/>

{/* CITY */}

<input
placeholder="City"
value={customer.city}
className="border p-3 w-full rounded"
onChange={(e)=>
setCustomer({...customer,city:e.target.value})
}
/>

{/* STATE AUTOCOMPLETE */}

<input
list="states"
placeholder="State"
value={customer.state}
className="border p-3 w-full rounded"
onChange={(e)=>
setCustomer({...customer,state:e.target.value})
}
/>

<datalist id="states">
{states.map((s)=>(
<option key={s} value={s}/>
))}
</datalist>

<input
placeholder="Phone Number"
className="border p-3 w-full rounded"
onChange={(e)=>
setCustomer({...customer,phone:e.target.value})
}
/>

<input
placeholder="Email Address"
className="border p-3 w-full rounded"
onChange={(e)=>
setCustomer({...customer,email:e.target.value})
}
/>

<button
onClick={placeOrder}
className="bg-pink-500 text-white px-6 py-3 rounded w-full"
>

{loading ? "Processing..." : "Place Order"}

</button>

</div>

</div>

);

}


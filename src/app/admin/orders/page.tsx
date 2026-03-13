"use client";

import { useEffect, useState } from "react";
import {
collection,
getDocs,
updateDoc,
doc,
query,
orderBy
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export default function AdminOrdersPage(){

const [orders,setOrders] = useState<any[]>([]);
const [loading,setLoading] = useState(true);
const [search,setSearch] = useState("");
const [tab,setTab] = useState("All");

/* ========================
FETCH ORDERS
======================== */

useEffect(()=>{

const fetchOrders = async()=>{

try{

const q = query(
collection(db,"orders"),
orderBy("createdAt","desc")
);

const snapshot = await getDocs(q);

const data = snapshot.docs.map(doc=>({
id:doc.id,
...doc.data()
}));

setOrders(data);

}catch(error){

console.log(error);

}

setLoading(false);

};

fetchOrders();

},[]);


/* ========================
SEND TO QIKINK
======================== */

const sendToQikink = async(orderId:string)=>{

try{

const res = await fetch("/api/qikink/send-order",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({orderId})

});

const data = await res.json();

if(data.success){

alert("Order sent to Qikink 🚀");

await updateDoc(doc(db,"orders",orderId),{
status:"Processing"
});

window.location.reload();

}else{

alert("Failed: " + (data.error || JSON.stringify(data)));

}

}catch(err){

alert("Server error");

}

};


/* ========================
STATUS FUNCTIONS
======================== */

const markShipped = async(orderId:string)=>{

await updateDoc(doc(db,"orders",orderId),{
status:"Shipped"
});

window.location.reload();

};

const markDelivered = async(orderId:string)=>{

await updateDoc(doc(db,"orders",orderId),{
status:"Delivered"
});

window.location.reload();

};


/* ========================
FILTER ORDERS
======================== */

let filteredOrders = orders;

if(tab !== "All"){
filteredOrders = filteredOrders.filter(o=>o.status === tab);
}

filteredOrders = filteredOrders.filter(o=>
o.id.toLowerCase().includes(search.toLowerCase())
);


/* ========================
LOADING
======================== */

if(loading){

return(

<div className="min-h-screen flex items-center justify-center">

Loading Orders...

</div>

);

}


/* ========================
UI
======================== */

return(

<div className="min-h-screen bg-gray-50 p-6">

<h1 className="text-3xl font-bold text-purple-600 mb-6">

Orders Management

</h1>


<input
type="text"
placeholder="Search Order ID..."
className="border p-3 rounded-lg w-full mb-6"
value={search}
onChange={(e)=>setSearch(e.target.value)}
/>


<div className="flex gap-3 mb-6 flex-wrap">

{["All","Pending","Processing","Shipped","Delivered"].map(t=>(
<button
key={t}
onClick={()=>setTab(t)}
className={`px-4 py-2 rounded-lg ${
tab===t
? "bg-purple-600 text-white"
: "bg-white border"
}`}
>
{t}
</button>
))}

</div>


<div className="space-y-6">

{filteredOrders.map(order=>{

const date =
order.createdAt?.toDate
? order.createdAt.toDate().toLocaleString()
: "No date";

return(

<div
key={order.id}
className="bg-white p-6 rounded-2xl shadow-md"
>

<p className="text-gray-500">
Order ID
</p>

<h2 className="text-lg font-bold">
{order.id}
</h2>

<p className="text-gray-400 text-sm mt-1">
{date}
</p>


<p className="mt-2 font-semibold">
Product: {order.product?.name || "No product"}
</p>


<p className="text-pink-600 font-bold">
₹{
order.product?.sellingPrice ||
order.productDetails?.price ||
order.products?.[0]?.price ||
order.amount ||
order.price ||
0
}
</p>


<div className="mt-3 text-sm">

<p>
Customer: {order.customer?.firstName} {order.customer?.lastName}
</p>

<p>
Phone: {order.customer?.phone}
</p>

<p>
Address: {order.customer?.address}
</p>

<p>
{order.customer?.city} - {order.customer?.zip}
</p>

<p>
{order.customer?.state}
</p>

</div>


<div className="mt-3">

<span className={`px-3 py-1 rounded-full text-sm font-semibold ${
order.status === "Delivered"
? "bg-green-100 text-green-700"
: order.status === "Shipped"
? "bg-blue-100 text-blue-700"
: order.status === "Processing"
? "bg-purple-100 text-purple-700"
: "bg-yellow-100 text-yellow-700"
}`}>

{order.status || "Pending"}

</span>

</div>


<div className="mt-4 flex gap-3 flex-wrap">

<button
onClick={()=>sendToQikink(order.id)}
className="bg-purple-600 text-white px-4 py-2 rounded-lg"
>
Send To Qikink
</button>


<button
onClick={()=>markShipped(order.id)}
className="bg-blue-500 text-white px-4 py-2 rounded-lg"
>
Mark Shipped
</button>


<button
onClick={()=>markDelivered(order.id)}
className="bg-green-500 text-white px-4 py-2 rounded-lg"
>
Mark Delivered
</button>

</div>

</div>

);

})}

</div>

</div>

);

}

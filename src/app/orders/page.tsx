"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminOrders(){

const [orders,setOrders] = useState<any[]>([]);
const [loading,setLoading] = useState(true);

useEffect(()=>{

const fetchOrders = async()=>{

const q = query(
collection(db,"orders"),
orderBy("createdAt","desc") // newest first
);

const snap = await getDocs(q);

const data = snap.docs.map(doc=>({
id:doc.id,
...doc.data()
}));

setOrders(data);
setLoading(false);

};

fetchOrders();

},[]);

/* MARK SHIPPED */

const markShipped = async(id:string)=>{

await updateDoc(doc(db,"orders",id),{
status:"Shipped"
});

setOrders(prev =>
prev.map(o => o.id === id ? {...o,status:"Shipped"} : o)
);

};

/* MARK DELIVERED */

const markDelivered = async(id:string)=>{

await updateDoc(doc(db,"orders",id),{
status:"Delivered"
});

setOrders(prev =>
prev.map(o => o.id === id ? {...o,status:"Delivered"} : o)
);

};

/* SEND TO QIKINK */

const sendToQikink = async(order:any)=>{

try{

const res = await fetch("/api/qikink/send-order",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(order)
});

const data = await res.json();

if(data.success){
alert("Order Sent To Qikink ✅");
}else{
alert("Failed to send order");
}

}catch(err){

alert("Server error");

}

};

if(loading){
return(
<div className="min-h-screen flex items-center justify-center">
Loading Orders...
</div>
);
}

return(

<div className="min-h-screen p-6 bg-gradient-to-br from-purple-50 to-white">

<div className="max-w-4xl mx-auto">

<h1 className="text-3xl font-bold text-purple-600 mb-8">
Orders Management
</h1>

{orders.length === 0 ? (

<div className="bg-white p-10 rounded-xl shadow text-center">
No Orders Yet
</div>

) : (

<div className="space-y-6">

{orders.map(order=>(

<div
key={order.id}
className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
>

<p className="text-sm text-gray-400">
Order ID
</p>

<h2 className="font-semibold mb-2">
{order.id}
</h2>

<p className="text-lg font-bold text-purple-600">
₹{order.price}
</p>

<p className="mt-1 text-sm text-gray-600">
Status: {order.status}
</p>

<div className="flex flex-wrap gap-3 mt-4">

<button
onClick={()=>markShipped(order.id)}
className="bg-blue-500 text-white px-4 py-2 rounded-lg"
>
Mark Shipped
</button>

<button
onClick={()=>markDelivered(order.id)}
className="bg-green-600 text-white px-4 py-2 rounded-lg"
>
Mark Delivered
</button>

<button
onClick={()=>sendToQikink(order)}
className="bg-purple-600 text-white px-4 py-2 rounded-lg"
>
Send To Qikink
</button>

</div>

</div>

))}

</div>

)}

</div>

</div>

);

}

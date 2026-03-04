"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
collection,
getDocs,
query,
where
} from "firebase/firestore";

export default function Orders(){

const [orders,setOrders] = useState<any[]>([])
const [loading,setLoading] = useState(true)

useEffect(()=>{

async function loadOrders(){

try{

const user = auth.currentUser

if(!user){
setLoading(false)
return
}

const q = query(
collection(db,"orders"),
where("sellerId","==",user.uid)
)

const snap = await getDocs(q)

const list = snap.docs.map(d=>({
id:d.id,
...d.data()
}))

setOrders(list)

}catch(err){
console.log(err)
}

setLoading(false)

}

loadOrders()

},[])

if(loading){
return(

<div className="p-10 text-center">
Loading orders...
</div>
)
}return(

<div><h1 className="text-2xl font-bold mb-6">
My Orders
</h1>{orders.length===0 && (

<div className="bg-white p-6 rounded shadow">
No orders yet
</div>
)}<div className="space-y-4">{orders.map((o:any)=>(

<div
key={o.id}
className="bg-white shadow p-4 rounded"
><h3 className="font-bold">
{o.productName}
</h3><p>
Customer: {o.customerName}
</p><p>
Price: ₹{o.price}
</p><p className="text-blue-600">
Status: {o.status}
</p></div>))}

</div></div>)

}

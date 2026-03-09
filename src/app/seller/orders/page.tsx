"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
collection,
query,
where,
getDocs,
doc,
updateDoc
} from "firebase/firestore";

export default function SellerOrders(){

const [orders,setOrders] = useState<any[]>([]);
const [loading,setLoading] = useState(true);

const loadOrders = async()=>{

const user = auth.currentUser;

if(!user) return;

const q = query(
collection(db,"orders"),
where("sellerId","==",user.uid)
);

const snap = await getDocs(q);

let list:any = [];

snap.forEach((d)=>{

list.push({
id:d.id,
...d.data()
});

});

setOrders(list);
setLoading(false);

};

useEffect(()=>{
loadOrders();
},[]);


/* UPDATE STATUS */

const updateStatus = async(id:string,status:string)=>{

await updateDoc(
doc(db,"orders",id),
{status:status}
);

loadOrders();

};


if(loading){
return(
<div className="p-6">
Loading orders...
</div>
);
}

return(

<div>

<h1 className="text-2xl font-bold mb-6">
Seller Orders
</h1>

<div className="space-y-4">

{orders.map((o:any)=>(

<div
key={o.id}
className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
>

<div>

<h2 className="font-bold">
{o.productName}
</h2>

<p className="text-gray-500">
Customer: {o.customerName}
</p>

<p className="text-gray-500">
Price: ₹{o.price}
</p>

<p className="text-sm text-gray-400">
Status: {o.status}
</p>

</div>

<div className="space-x-2">

<button
onClick={()=>updateStatus(o.id,"shipped")}
className="bg-blue-500 text-white px-3 py-1 rounded"
>
Ship
</button>

<button
onClick={()=>updateStatus(o.id,"delivered")}
className="bg-green-500 text-white px-3 py-1 rounded"
>
Deliver
</button>

</div>

</div>

))}

</div>

</div>

);

}

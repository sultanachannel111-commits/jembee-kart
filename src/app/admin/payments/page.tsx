"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { DollarSign } from "lucide-react";

export default function AdminPayments(){

const [payments,setPayments] = useState<any[]>([]);

useEffect(()=>{

const unsub = onSnapshot(collection(db,"orders"),(snap)=>{

const list = snap.docs.map(doc=>({
id:doc.id,
...doc.data()
}));

setPayments(list);

});

return ()=>unsub();

},[]);

return(

<div className="p-6">

<div className="flex items-center gap-2 mb-6">

<DollarSign className="text-green-600"/>

<h1 className="text-2xl font-bold">
Online Payments
</h1>

</div>


<div className="bg-white shadow rounded-xl p-6">

<table className="w-full text-sm">

<thead className="border-b">

<tr className="text-left">

<th className="py-2">Order ID</th>
<th>User</th>
<th>Amount</th>
<th>Payment</th>
<th>Status</th>

</tr>

</thead>


<tbody>

{payments.map((p)=>(
<tr key={p.id} className="border-b">

<td className="py-2">
{p.id}
</td>

<td>
{p.userEmail || "User"}
</td>

<td>
₹{p.total || 0}
</td>

<td className="text-purple-600 font-semibold">
UPI
</td>

<td>

<span
className={`text-xs px-2 py-1 rounded
${p.status==="paid"
? "bg-green-100 text-green-700"
: "bg-red-100 text-red-700"
}`}
>

{p.status || "pending"}

</span>

</td>

</tr>
))}

</tbody>

</table>

</div>

</div>

);

}

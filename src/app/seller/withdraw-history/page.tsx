"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
collection,
query,
where,
getDocs
} from "firebase/firestore";

export default function WithdrawHistory(){

const [list,setList] = useState<any[]>([]);
const [loading,setLoading] = useState(true);

useEffect(()=>{

const load = async()=>{

const user = auth.currentUser;

if(!user) return;

const q = query(
collection(db,"withdrawRequests"),
where("sellerId","==",user.uid)
);

const snap = await getDocs(q);

let data:any = [];

snap.forEach((d)=>{
data.push({
id:d.id,
...d.data()
});
});

setList(data);
setLoading(false);

};

load();

},[]);


if(loading){
return(
<div className="p-6">
Loading history...
</div>
);
}

return(

<div>

<h1 className="text-2xl font-bold mb-6">
Withdraw History
</h1>

<div className="space-y-4">

{list.map((w:any)=>(

<div
key={w.id}
className="bg-white p-4 rounded-xl shadow flex justify-between"
>

<div>

<p className="font-semibold">
₹{w.amount}
</p>

<p className="text-gray-500">
UPI: {w.upi}
</p>

</div>

<div>

<span className={`px-3 py-1 rounded text-white text-sm
${w.status==="approved" ? "bg-green-500" :
w.status==="rejected" ? "bg-red-500" :
"bg-yellow-500"}
`}>

{w.status}

</span>

</div>

</div>

))}

</div>

</div>

);

}

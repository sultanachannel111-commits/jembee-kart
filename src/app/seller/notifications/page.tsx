"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
collection,
query,
where,
getDocs
} from "firebase/firestore";

export default function SellerNotifications(){

const [notifications,setNotifications] = useState<any[]>([]);
const [loading,setLoading] = useState(true);

useEffect(()=>{

const loadNotifications = async()=>{

try{

const user = auth.currentUser;

if(!user) return;

const q = query(
collection(db,"notifications"),
where("sellerId","==",user.uid)
);

const snap = await getDocs(q);

let data:any=[];

snap.forEach((d)=>{
data.push({
id:d.id,
...d.data()
});
});

setNotifications(data);

}catch(err){
console.log(err);
}

setLoading(false);

};

loadNotifications();

},[]);


if(loading){
return(
<div className="p-6">
Loading notifications...
</div>
);
}

return(

<div>

<h1 className="text-2xl font-bold mb-6">
Notifications
</h1>

{notifications.length===0 && (
<p className="text-gray-500">
No notifications yet
</p>
)}

<div className="space-y-4">

{notifications.map((n:any)=>(

<div
key={n.id}
className="bg-white shadow rounded-xl p-4"
>

<p className="font-semibold">
{n.title}
</p>

<p className="text-gray-600 mt-1">
{n.message}
</p>

<p className="text-xs text-gray-400 mt-2">
{n.type}
</p>

</div>

))}

</div>

</div>

);

}

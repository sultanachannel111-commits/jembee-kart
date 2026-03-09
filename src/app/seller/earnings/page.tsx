"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
collection,
query,
where,
getDocs
} from "firebase/firestore";

export default function SellerEarnings(){

const [orders,setOrders] = useState(0);
const [revenue,setRevenue] = useState(0);
const [loading,setLoading] = useState(true);

useEffect(()=>{

const loadEarnings = async()=>{

const user = auth.currentUser;

if(!user) return;

const q = query(
collection(db,"orders"),
where("sellerId","==",user.uid)
);

const snap = await getDocs(q);

let totalRevenue = 0;

snap.forEach((doc)=>{

const data:any = doc.data();

totalRevenue += data.price || 0;

});

setOrders(snap.size);
setRevenue(totalRevenue);
setLoading(false);

};

loadEarnings();

},[]);


if(loading){
return(
<div className="p-6">
Loading earnings...
</div>
);
}

return(

<div>

<h1 className="text-2xl font-bold mb-6">
Seller Earnings
</h1>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

<div className="bg-white p-6 rounded-xl shadow">

<p className="text-gray-500">
Total Orders
</p>

<h2 className="text-2xl font-bold">
{orders}
</h2>

</div>


<div className="bg-white p-6 rounded-xl shadow">

<p className="text-gray-500">
Total Revenue
</p>

<h2 className="text-2xl font-bold">
₹{revenue}
</h2>

</div>


<div className="bg-white p-6 rounded-xl shadow">

<p className="text-gray-500">
Available Balance
</p>

<h2 className="text-2xl font-bold">
₹{revenue}
</h2>

</div>

</div>

</div>

);

}

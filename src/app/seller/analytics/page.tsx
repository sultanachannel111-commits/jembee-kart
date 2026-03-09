"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
collection,
query,
where,
getDocs
} from "firebase/firestore";

export default function SellerAnalytics(){

const [orders,setOrders] = useState(0);
const [revenue,setRevenue] = useState(0);
const [products,setProducts] = useState(0);
const [loading,setLoading] = useState(true);

useEffect(()=>{

const loadData = async()=>{

try{

const user = auth.currentUser;

if(!user) return;

/* PRODUCTS */

const p = query(
collection(db,"products"),
where("sellerId","==",user.uid)
);

const productSnap = await getDocs(p);

setProducts(productSnap.size);

/* ORDERS */

const o = query(
collection(db,"orders"),
where("sellerId","==",user.uid)
);

const orderSnap = await getDocs(o);

setOrders(orderSnap.size);

let total = 0;

orderSnap.forEach((doc:any)=>{
const d = doc.data();
total += d.total || 0;
});

setRevenue(total);

}catch(err){
console.log(err);
}

setLoading(false);

};

loadData();

},[]);


if(loading){
return(
<div className="p-6">
Loading analytics...
</div>
);
}

return(

<div>

<h1 className="text-2xl font-bold mb-6">
Seller Analytics
</h1>

<div className="grid md:grid-cols-3 gap-6">

<div className="bg-white p-6 rounded-xl shadow">

<p className="text-gray-500">
Total Products
</p>

<h2 className="text-3xl font-bold">
{products}
</h2>

</div>


<div className="bg-white p-6 rounded-xl shadow">

<p className="text-gray-500">
Total Orders
</p>

<h2 className="text-3xl font-bold">
{orders}
</h2>

</div>


<div className="bg-white p-6 rounded-xl shadow">

<p className="text-gray-500">
Total Revenue
</p>

<h2 className="text-3xl font-bold">
₹{revenue}
</h2>

</div>

</div>

</div>

);

}

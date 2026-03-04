"use client";

import { useEffect,useState } from "react";
import { useParams } from "next/navigation";
import { collection,getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SellerDetails(){

const params = useParams();
const email = params.email;

const [products,setProducts]=useState([]);

useEffect(()=>{
loadProducts();
},[]);

async function loadProducts(){

const snap = await getDocs(collection(db,"products"));

const list=[];

snap.forEach((doc)=>{

const data=doc.data();

if(data.sellerEmail===email){
list.push(data);
}

});

setProducts(list);

}

return(

<div className="p-6">

<h1 className="text-2xl font-bold mb-6">
Seller Products
</h1>

<div className="space-y-3">

{products.map((p,i)=>(

<div key={i} className="border p-4 rounded">

<div>{p.name}</div>
<div>₹{p.price}</div>

</div>

))}

</div>

</div>

);

}

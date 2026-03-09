"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
collection,
query,
where,
getDocs
} from "firebase/firestore";

export default function SellerReviews(){

const [reviews,setReviews] = useState<any[]>([]);
const [loading,setLoading] = useState(true);

useEffect(()=>{

const loadReviews = async()=>{

try{

const user = auth.currentUser;

if(!user) return;

const q = query(
collection(db,"reviews"),
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

setReviews(data);

}catch(err){
console.log(err);
}

setLoading(false);

};

loadReviews();

},[]);


if(loading){
return(
<div className="p-6">
Loading reviews...
</div>
);
}

return(

<div>

<h1 className="text-2xl font-bold mb-6">
Customer Reviews
</h1>

{reviews.length === 0 && (
<p className="text-gray-500">
No reviews yet
</p>
)}

<div className="space-y-4">

{reviews.map((r:any)=>(

<div
key={r.id}
className="bg-white shadow rounded-xl p-4"
>

<div className="flex justify-between">

<p className="font-semibold">
{r.productName}
</p>

<p className="text-yellow-500">
⭐ {r.rating}/5
</p>

</div>

<p className="text-gray-600 mt-2">
{r.comment}
</p>

<p className="text-sm text-gray-400 mt-2">
Customer: {r.customerName}
</p>

</div>

))}

</div>

</div>

);

}

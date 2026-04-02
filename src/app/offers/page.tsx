"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  Timestamp
} from "firebase/firestore";

export default function OfferPage(){

  const [products,setProducts] = useState<any[]>([]);
  const [offers,setOffers] = useState<any[]>([]);

  const [selectedProduct,setSelectedProduct] = useState("");
  const [discount,setDiscount] = useState(0);

  const [startDate,setStartDate] = useState("");
  const [startTime,setStartTime] = useState("");

  const [endDate,setEndDate] = useState("");
  const [endTime,setEndTime] = useState("");

  /* 🔄 LOAD PRODUCTS + OFFERS */
  useEffect(()=>{
    loadData();
  },[]);

  const loadData = async()=>{

    const pSnap = await getDocs(collection(db,"products"));
    const arr:any[] = [];

    pSnap.forEach(d=>{
      arr.push({ id:d.id, ...d.data() });
    });

    setProducts(arr);

    const oSnap = await getDocs(collection(db,"offers"));
    const off:any[] = [];

    oSnap.forEach(d=>{
      off.push({ id:d.id, ...d.data() });
    });

    setOffers(off);
  };

  /* 🕒 CREATE TIMESTAMP */
  const makeTimestamp = (date:string,time:string)=>{
    const full = new Date(`${date}T${time}`);
    return Timestamp.fromDate(full);
  };

  /* ➕ ADD OFFER */
  const addOffer = async()=>{

    if(!selectedProduct) return alert("Select product");
    if(!discount) return alert("Enter discount");

    try{

      const startAt = makeTimestamp(startDate,startTime);
      const endAt = makeTimestamp(endDate,endTime);

      await setDoc(
        doc(db,"offers",selectedProduct), // ✅ SAME ID
        {
          discount:Number(discount),
          startAt,
          endAt,
          active:true
        }
      );

      alert("Offer Added ✅");
      loadData();

    }catch(err){
      alert("Error adding offer");
    }
  };

  /* ❌ DELETE */
  const deleteOffer = async(id:string)=>{
    await deleteDoc(doc(db,"offers",id));
    loadData();
  };

  /* 🔥 CHECK ACTIVE */
  const isActive = (o:any)=>{
    const now = new Date();

    const start = o.startAt?.toDate();
    const end = o.endAt?.toDate();

    return now >= start && now <= end;
  };

  return(
<div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-white p-4">

<h1 className="text-2xl font-bold text-center mb-4">
🔥 Offer Management
</h1>

{/* FORM */}
<div className="backdrop-blur bg-white/60 p-4 rounded-3xl shadow-xl space-y-3">

<select
value={selectedProduct}
onChange={e=>setSelectedProduct(e.target.value)}
className="w-full p-3 rounded-xl border">
<option value="">Select Product</option>
{products.map(p=>(
<option key={p.id} value={p.id}>
{p.name}
</option>
))}
</select>

<input
type="number"
placeholder="Discount %"
value={discount}
onChange={e=>setDiscount(Number(e.target.value))}
className="w-full p-3 rounded-xl border"
/>

{/* START */}
<div>
<p className="text-sm">Start Time</p>
<input type="date" onChange={e=>setStartDate(e.target.value)}
className="w-full p-2 rounded border"/>
<input type="time" onChange={e=>setStartTime(e.target.value)}
className="w-full p-2 rounded border mt-1"/>
</div>

{/* END */}
<div>
<p className="text-sm">End Time</p>
<input type="date" onChange={e=>setEndDate(e.target.value)}
className="w-full p-2 rounded border"/>
<input type="time" onChange={e=>setEndTime(e.target.value)}
className="w-full p-2 rounded border mt-1"/>
</div>

<button
onClick={addOffer}
className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-2xl">
Add Offer 🚀
</button>

</div>

{/* OFFERS LIST */}
<div className="mt-6 space-y-3">

{offers.map(o=>{
  const active = isActive(o);

  return(
<div key={o.id}
className="backdrop-blur bg-white/70 p-4 rounded-2xl shadow">

<p className="text-sm text-gray-500">Product ID</p>
<p className="font-bold">{o.id}</p>

<p className="text-pink-600 font-bold text-lg">
{ o.discount }% OFF
</p>

<p className="text-xs">
Start: {o.startAt?.toDate().toLocaleString()}
</p>

<p className="text-xs">
End: {o.endAt?.toDate().toLocaleString()}
</p>

<div className="flex gap-2 mt-2">
<span className={`px-3 py-1 text-white rounded ${
active ? "bg-green-500" : "bg-gray-400"
}`}>
{active ? "Active" : "Expired"}
</span>

<button
onClick={()=>deleteOffer(o.id)}
className="bg-red-500 text-white px-3 rounded">
Delete
</button>
</div>

</div>
  );
})}

</div>

</div>
  );
}

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

  /* 🔄 LOAD DATA */
  useEffect(()=>{
    loadData();
  },[]);

  const loadData = async()=>{

    // PRODUCTS
    const pSnap = await getDocs(collection(db,"products"));
    const arr:any[] = [];

    pSnap.forEach(d=>{
      arr.push({ id:d.id, ...d.data() });
    });

    setProducts(arr);

    // OFFERS
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

    if(!selectedProduct) return alert("Select product ❌");
    if(!discount) return alert("Enter discount ❌");

    if(!startDate || !startTime || !endDate || !endTime){
      return alert("Select date & time ❌");
    }

    try{

      // 🔥 DUPLICATE CHECK
      const existing = await getDocs(collection(db,"offers"));

      const already = existing.docs.find(
        d => d.id === selectedProduct && d.data().active
      );

      if(already){
        return alert("Offer already exists for this product ❌");
      }

      const startAt = makeTimestamp(startDate,startTime);
      const endAt = makeTimestamp(endDate,endTime);

      // 🔥 SAVE (FINAL FIXED STRUCTURE)
      await setDoc(
        doc(db,"offers",selectedProduct),
        {
          productId: selectedProduct, // ✅ MATCH FIX
          discount: Number(discount),

          startAt,
          endAt,

          // 🔥 CHECKOUT USE करेगा
          endDate: endAt.toDate().toISOString(),

          active: true,
          type: "product",
          createdAt: new Date()
        }
      );

      alert("Offer Added ✅");

      setSelectedProduct("");
      setDiscount(0);

      loadData();

    }catch(err){
      alert("Error adding offer ❌");
    }
  };

  /* ❌ DELETE */
  const deleteOffer = async(id:string)=>{
    await deleteDoc(doc(db,"offers",id));
    loadData();
  };

  /* 🔥 ACTIVE CHECK */
  const isActive = (o:any)=>{
    const now = new Date();

    const start = o.startAt?.toDate();
    const end = o.endAt?.toDate();

    if(!start || !end) return false;

    return now >= start && now <= end;
  };

  return(
<div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-white p-4">

<h1 className="text-3xl font-bold text-center mb-6">
🔥 Offer Management
</h1>

{/* FORM */}
<div className="backdrop-blur-xl bg-white/60 border border-white/30 p-5 rounded-3xl shadow-xl space-y-4">

<select
value={selectedProduct}
onChange={e=>setSelectedProduct(e.target.value)}
className="w-full p-3 rounded-xl border bg-white/70">
<option value="">Select Product</option>
{products.map(p=>(
<option key={p.id} value={p.id}>
{p.name}
</option>
))}
</select>

{selectedProduct && (
  <p className="text-xs text-green-600">
    Selected ID: {selectedProduct}
  </p>
)}

<input
type="number"
placeholder="Discount %"
value={discount}
onChange={e=>setDiscount(Number(e.target.value))}
className="w-full p-3 rounded-xl border"
/>

{/* START */}
<div>
<p className="text-sm font-semibold">Start Time</p>
<input
type="date"
onChange={e=>setStartDate(e.target.value)}
className="w-full p-2 rounded border"
/>
<input
type="time"
onChange={e=>setStartTime(e.target.value)}
className="w-full p-2 rounded border mt-1"
/>
</div>

{/* END */}
<div>
<p className="text-sm font-semibold">End Time</p>
<input
type="date"
onChange={e=>setEndDate(e.target.value)}
className="w-full p-2 rounded border"
/>
<input
type="time"
onChange={e=>setEndTime(e.target.value)}
className="w-full p-2 rounded border mt-1"
/>
</div>

<button
onClick={addOffer}
className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-2xl font-bold shadow-lg">
Add Offer 🚀
</button>

</div>

{/* OFFERS LIST */}
<div className="mt-6 space-y-4">

{offers.map(o=>{
  const active = isActive(o);

  return(
<div key={o.id}
className="backdrop-blur-xl bg-white/70 border border-white/30 p-4 rounded-2xl shadow">

<p className="text-xs text-gray-500">Product ID</p>
<p className="font-bold text-sm">{o.productId}</p>

<p className="text-pink-600 font-bold text-xl mt-1">
{ o.discount }% OFF
</p>

<p className="text-xs mt-1">
Start: {o.startAt?.toDate().toLocaleString()}
</p>

<p className="text-xs">
End: {o.endAt?.toDate().toLocaleString()}
</p>

<div className="flex gap-2 mt-3">

<span className={`px-3 py-1 text-white rounded text-xs ${
active ? "bg-green-500" : "bg-gray-400"
}`}>
{active ? "Active" : "Expired"}
</span>

<button
onClick={()=>deleteOffer(o.id)}
className="bg-red-500 text-white px-3 py-1 rounded text-xs">
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

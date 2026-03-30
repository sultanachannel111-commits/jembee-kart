"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function ShippingAdminPage(){

  const [loading,setLoading] = useState(false);

  const [shipping,setShipping] = useState({
    prepaid: 0,
    cod: 0,
    freeShippingAbove: 500
  });

  /* 🔥 LOAD EXISTING DATA */
  useEffect(()=>{
    const loadData = async ()=>{
      try{
        const ref = doc(db,"config","shipping");
        const snap = await getDoc(ref);

        if(snap.exists()){
          const data = snap.data();

          setShipping({
            prepaid: data.prepaid || 0,
            cod: data.cod || 0,
            freeShippingAbove: data.freeShippingAbove || 0
          });
        }
      }catch(err){
        console.log("Load Error:", err);
      }
    };

    loadData();
  },[]);

  /* 💾 SAVE SETTINGS */
  const saveShipping = async ()=>{
    try{
      setLoading(true);

      await setDoc(doc(db,"config","shipping"),{
        prepaid: Number(shipping.prepaid) || 0,
        cod: Number(shipping.cod) || 0,
        freeShippingAbove: Number(shipping.freeShippingAbove) || 0
      });

      alert("Shipping Settings Saved ✅");
    }catch(err){
      alert("Error saving settings ❌");
      console.log(err);
    }finally{
      setLoading(false);
    }
  };

  return (

<div className="min-h-screen bg-gray-100 p-4">

<div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow">

<h1 className="text-xl font-bold mb-6 text-center">
🚚 Shipping Settings (Admin)
</h1>

{/* PREPAID */}
<div className="mb-5">
  <label className="text-sm font-medium">
    Prepaid Shipping Charge (₹)
  </label>

  <input
    type="number"
    value={shipping.prepaid}
    onChange={(e)=>setShipping({
      ...shipping,
      prepaid: e.target.value
    })}
    className="w-full mt-2 p-3 border rounded-xl"
    placeholder="Enter prepaid charge"
  />

  <p className="text-xs text-gray-500 mt-1">
    👉 0 = Free shipping for prepaid orders
  </p>
</div>

{/* COD */}
<div className="mb-5">
  <label className="text-sm font-medium">
    Cash on Delivery Charge (₹)
  </label>

  <input
    type="number"
    value={shipping.cod}
    onChange={(e)=>setShipping({
      ...shipping,
      cod: e.target.value
    })}
    className="w-full mt-2 p-3 border rounded-xl"
    placeholder="Enter COD charge"
  />

  <p className="text-xs text-gray-500 mt-1">
    👉 Example: ₹50 COD fee
  </p>
</div>

{/* FREE SHIPPING */}
<div className="mb-6">
  <label className="text-sm font-medium">
    Free Shipping Above (₹)
  </label>

  <input
    type="number"
    value={shipping.freeShippingAbove}
    onChange={(e)=>setShipping({
      ...shipping,
      freeShippingAbove: e.target.value
    })}
    className="w-full mt-2 p-3 border rounded-xl"
    placeholder="Example: 500"
  />

  <p className="text-xs text-gray-500 mt-1">
    👉 Order above this amount → FREE delivery
  </p>
</div>

{/* PREVIEW BOX */}
<div className="bg-gray-50 p-4 rounded-xl mb-6 text-sm">
  <p className="font-semibold mb-2">Preview:</p>

  <p>Prepaid Shipping: ₹{shipping.prepaid || 0}</p>
  <p>COD Charge: ₹{shipping.cod || 0}</p>
  <p>
    Free Shipping Above: ₹{shipping.freeShippingAbove || 0}
  </p>
</div>

{/* SAVE BUTTON */}
<button
  onClick={saveShipping}
  className="w-full bg-black text-white py-3 rounded-xl font-medium"
>
  {loading ? "Saving..." : "Save Settings"}
</button>

</div>

</div>

  );
}

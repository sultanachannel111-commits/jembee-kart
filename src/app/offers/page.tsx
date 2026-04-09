"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function OffersPage(){

  const [offers,setOffers] = useState<any[]>([]);

  useEffect(()=>{
    loadOffers();
  },[]);

  const loadOffers = async()=>{
    const snap = await getDocs(collection(db,"offers"));

    const arr = snap.docs.map(d=>({
      id:d.id,
      ...d.data()
    }));

    setOffers(arr);
  };

  return(
    <div className="p-4">

      <h1 className="text-2xl font-bold mb-4">
        🔥 Today Offers
      </h1>

      {offers.map((o:any)=>(
        <div key={o.id} className="border p-3 rounded mb-3">

          <p className="font-semibold">
            {o.type==="product"
              ? `Product: ${o.productId}`
              : `Category: ${o.category}`}
          </p>

          <p className="text-pink-600 font-bold">
            {o.discount}% OFF
          </p>

        </div>
      ))}

    </div>
  );
}

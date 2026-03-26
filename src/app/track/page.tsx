"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TrackPage(){

  const [orderId,setOrderId] = useState("");
  const router = useRouter();

  const handleTrack = ()=>{
    if(!orderId) return alert("Enter Order ID");
    router.push(`/track/${orderId}`);
  };

  return(
    <div className="min-h-screen flex items-center justify-center p-4">

      <div className="bg-white p-6 rounded-2xl shadow w-full max-w-md">

        <h1 className="text-xl font-bold mb-4 text-center">
          Track Your Order 📦
        </h1>

        <input
          placeholder="Enter Order ID"
          className="w-full border p-3 rounded-lg mb-4"
          value={orderId}
          onChange={(e)=>setOrderId(e.target.value)}
        />

        <button
          onClick={handleTrack}
          className="w-full bg-blue-600 text-white py-3 rounded-lg"
        >
          Track Order
        </button>

      </div>

    </div>
  );
}

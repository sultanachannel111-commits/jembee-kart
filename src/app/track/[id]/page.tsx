"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function TrackPage() {

  const { id } = useParams();
  const [order,setOrder] = useState<any>(null);

  useEffect(()=>{
    if(!id) return;

    const unsub = onSnapshot(doc(db,"orders",id as string),(snap)=>{
      if(snap.exists()){
        setOrder({id:snap.id,...snap.data()});
      }
    });

    return ()=>unsub();
  },[id]);

  if(!order) return <div className="p-5">Loading...</div>;

  const steps = ["Pending","Placed","Shipped","Out for Delivery","Delivered"];
  const current = steps.indexOf(order.status || "Pending");
  const progress = (current/(steps.length-1))*100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-white p-4">

      <div className="max-w-xl mx-auto backdrop-blur-xl bg-white/60 border border-white/30 p-5 rounded-3xl shadow-xl">

        <h1 className="text-2xl font-bold mb-4 text-center">
          🚚 Order Tracking
        </h1>

        <p className="text-sm text-gray-500">Order ID</p>
        <p className="font-bold">{order.id}</p>

        <p className="mt-2">
          Status: <span className="text-green-600 font-bold">{order.status}</span>
        </p>

        {/* PROGRESS BAR */}
        <div className="mt-6 relative">

          <div className="h-2 bg-gray-300 rounded-full"/>

          <div
            className="h-2 bg-gradient-to-r from-green-400 to-green-600 absolute top-0 rounded-full transition-all duration-500"
            style={{width:`${progress}%`}}
          />

          <div
            className="absolute -top-5 text-2xl transition-all duration-500"
            style={{left:`${progress}%`}}
          >
            🚚
          </div>

        </div>

        <div className="flex justify-between mt-4 text-xs">
          {steps.map((s,i)=>(
            <span
              key={i}
              className={i<=current?"text-green-600 font-bold":"text-gray-400"}
            >
              {s}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}

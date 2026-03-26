"use client";

import { useEffect } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function PaymentSuccess(){

  useEffect(()=>{

    const saveOrder = async()=>{

      const data = localStorage.getItem("temp-order");

      if(!data) return;

      const order = JSON.parse(data);

      await addDoc(collection(db,"orders"),{
        ...order,
        paymentStatus:"success",
        status:"confirmed",
        createdAt:serverTimestamp()
      });

      localStorage.removeItem("temp-order");

    };

    saveOrder();

  },[]);

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold text-green-600">
        Payment Successful ✅
      </h1>
    </div>
  );
}

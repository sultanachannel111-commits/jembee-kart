"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

import {
  collection,
  getDocs,
  deleteDoc
} from "firebase/firestore";

export default function OrderSuccess(){

  const { id } = useParams();

  useEffect(()=>{

    const handle = async()=>{

      if(!id) return;

      // ✅ ONLY PAYMENT STATUS UPDATE
      await updateDoc(
        doc(db,"orders",id as string),
        {
          paymentStatus:"paid"
        }
      );

      // 🧹 CLEAR CART
      const user = auth.currentUser;
      if(!user) return;

      const snap = await getDocs(
        collection(db,"carts",user.uid,"items")
      );

      for(const d of snap.docs){
        await deleteDoc(
          doc(db,"carts",user.uid,"items",d.id)
        );
      }

    };

    handle();

  },[id]);

  return(

    <div className="min-h-screen flex items-center justify-center bg-green-50">

      <div className="bg-white p-6 rounded-xl shadow text-center">

        <h1 className="text-green-600 text-2xl font-bold">
          Payment Successful 🎉
        </h1>

        <p className="mt-2">
          Order ID: {id}
        </p>

        <p className="text-gray-500 mt-2">
          Your order is being prepared...
        </p>

      </div>

    </div>

  );
}

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  doc,
  updateDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc
} from "firebase/firestore";

import { db, auth } from "@/lib/firebase";

export default function SuccessInner(){

  const params = useSearchParams();
  const router = useRouter();

  const orderId = params.get("orderId");

  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    const verifyPayment = async()=>{

      if(!orderId) return;

      const orderRef = doc(db,"orders",orderId);
      const snap = await getDoc(orderRef);

      if(!snap.exists()){
        alert("Order not found ❌");
        return;
      }

      const data:any = snap.data();

      // 🔥 duplicate safe
      if(data.paymentStatus !== "Paid"){
        await updateDoc(orderRef,{
          paymentStatus:"Paid",
          status:"Placed"
        });
      }

      // 🔥 clear cart
      const user = auth.currentUser;
      if(user){
        const snapCart = await getDocs(
          collection(db,"carts",user.uid,"items")
        );

        for(const d of snapCart.docs){
          await deleteDoc(
            doc(db,"carts",user.uid,"items",d.id)
          );
        }
      }

      localStorage.removeItem("buy-now");

      setLoading(false);

    };

    verifyPayment();

  },[orderId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 to-white">

      <div className="backdrop-blur-xl bg-white/70 p-8 rounded-3xl shadow-xl text-center">

        {loading ? (
          <p>Verifying...</p>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-green-600">
              Payment Successful 🎉
            </h1>

            <p className="mt-2">Order ID: {orderId}</p>

            <div className="flex gap-3 mt-5">

              <button
                onClick={()=>router.push(`/track/${orderId}`)}
                className="bg-black text-white px-4 py-2 rounded-xl"
              >
                Track
              </button>

              <button
                onClick={()=>router.push("/")}
                className="bg-gray-200 px-4 py-2 rounded-xl"
              >
                Home
              </button>

            </div>
          </>
        )}

      </div>

    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import {
  doc,
  updateDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc
} from "firebase/firestore";

import { db, auth } from "@/lib/firebase";

export default function PaymentSuccess(){

  const params = useSearchParams();
  const router = useRouter();

  const orderId = params.get("orderId");

  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    const verifyPayment = async()=>{

      try{

        if(!orderId){
          alert("Invalid order ❌");
          return;
        }

        console.log("🔍 VERIFY ORDER:", orderId);

        // 🔥 CHECK ORDER EXISTS
        const orderRef = doc(db,"orders",orderId);
        const snap = await getDoc(orderRef);

        if(!snap.exists()){
          alert("Order not found ❌");
          return;
        }

        const orderData:any = snap.data();

        // 🔥 DUPLICATE PROTECTION
        if(orderData.paymentStatus === "Paid"){
          console.log("⚠️ Already paid");
          setLoading(false);
          return;
        }

        // 🔥 UPDATE ORDER
        await updateDoc(orderRef,{
          paymentStatus:"Paid",
          status:"Placed"
        });

        console.log("✅ ORDER UPDATED");

        // 🔥 CLEAR CART
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

        // 🔥 CLEAR BUY NOW
        localStorage.removeItem("buy-now");

        setLoading(false);

      }catch(err){
        console.log(err);
        alert("Payment verification failed ❌");
      }

    };

    verifyPayment();

  },[orderId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 via-white to-purple-100 p-4">

      <div className="backdrop-blur-xl bg-white/70 border border-white/30 p-8 rounded-3xl shadow-xl text-center max-w-sm w-full">

        {loading ? (
          <p className="text-gray-500">Verifying payment...</p>
        ) : (
          <>
            <div className="text-5xl mb-3">✅</div>

            <h1 className="text-2xl font-bold text-green-600">
              Payment Successful
            </h1>

            <p className="text-sm mt-2 text-gray-500">
              Order ID: {orderId}
            </p>

            <p className="mt-3 text-gray-600">
              Your order is confirmed 🚀
            </p>

            {/* BUTTONS */}
            <div className="flex gap-3 mt-6">

              <button
                onClick={()=>router.push(`/track/${orderId}`)}
                className="flex-1 bg-black text-white py-2 rounded-xl"
              >
                Track Order
              </button>

              <button
                onClick={()=>router.push("/")}
                className="flex-1 bg-gray-200 py-2 rounded-xl"
              >
                Shop More
              </button>

            </div>

          </>
        )}

      </div>

    </div>
  );
}

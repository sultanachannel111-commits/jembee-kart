"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export default function OrderSuccess(){

  const { id } = useParams();
  const router = useRouter();

  const [order,setOrder] = useState<any>(null);
  const [done,setDone] = useState(false);

  useEffect(()=>{

    const handle = async()=>{

      if(!id || done) return;

      try{

        // ✅ FETCH ORDER
        const snap = await getDoc(doc(db,"orders",id as string));

        if(snap.exists()){
          setOrder(snap.data());
        }

        // ✅ PAYMENT UPDATE
        await updateDoc(
          doc(db,"orders",id as string),
          {
            paymentStatus:"paid"
          }
        );

        // 🧹 CLEAR CART
        const user = auth.currentUser;
        if(user){
          const cartSnap = await getDocs(
            collection(db,"carts",user.uid,"items")
          );

          for(const d of cartSnap.docs){
            await deleteDoc(
              doc(db,"carts",user.uid,"items",d.id)
            );
          }
        }

        // 📲 WHATSAPP MESSAGE
        if(order){
          const msg = `🛍️ Order Placed!\nOrder ID: ${id}\nTotal: ₹${order.total}`;
          window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
        }

        setDone(true);

      }catch(err){
        console.log("Order success error:",err);
      }

    };

    handle();

  },[id,done]);

  return(

<div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-emerald-200 flex items-center justify-center p-4">

<div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl text-center max-w-md w-full">

{/* ✅ ICON */}
<div className="text-5xl mb-3">✅</div>

<h1 className="text-green-600 text-2xl font-bold">
Payment Successful 🎉
</h1>

<p className="mt-2 text-sm text-gray-600">
Your order has been placed successfully
</p>

{/* ORDER ID */}
<div className="mt-4 bg-gray-100 p-3 rounded-xl text-sm">
Order ID: <span className="font-bold">{id}</span>
</div>

{/* TOTAL */}
{order && (
  <p className="mt-2 font-semibold text-lg text-green-700">
    Total: ₹{order.total}
  </p>
)}

{/* STATUS */}
<p className="text-gray-500 mt-2 text-sm">
Your order is being prepared 🚚
</p>

{/* BUTTONS */}
<div className="flex gap-3 mt-6">

<button
onClick={()=>router.push(`/order/${id}`)}
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

</div>

</div>
  );
}

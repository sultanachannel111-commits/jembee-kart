"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export default function OrderSuccess(){

  const { id } = useParams();
  const router = useRouter();

  const [order,setOrder] = useState<any>(null);
  const [done,setDone] = useState(false);
  const [verifying, setVerifying] = useState(true); // Loading state added

  useEffect(()=>{

    const handle = async()=>{

      if(!id || done) return;

      try{
        const snap = await getDoc(doc(db,"orders",id as string));
        if(!snap.exists()) return;
        const data = snap.data();
        setOrder(data);

        const verifyRes = await fetch("/api/cashfree/verify-payment",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ orderId: id })
        });

        const verifyData = await verifyRes.json();

        if(!verifyData.success){
          console.log("❌ Payment not verified");
          setVerifying(false);
          return;
        }

        // ✅ UPDATE FIREBASE
        await updateDoc(doc(db,"orders",id as string), {
            paymentStatus:"paid",
            orderStatus: "READY_FOR_MANUAL_QIKINK"
        });

        // 🧹 CLEAR CART
        const user = auth.currentUser;
        if(user){
          const cartSnap = await getDocs(collection(db,"carts",user.uid,"items"));
          for(const d of cartSnap.docs){
            await deleteDoc(doc(db,"carts",user.uid,"items",d.id));
          }
        }
        localStorage.removeItem("buy-now");

        // 🔔 ADMIN WHATSAPP NOTIFICATION (7061369213)
        const adminMobile = "917061369213";
        const adminMsg = `✅ *PAISA AA GAYA!* \n\nOrder #${id} verified (₹${data.total}).\nManual order Qikink par place karein.`;
        
        await addDoc(collection(db, "notifications"), {
          type: "ONLINE_PAID",
          message: `💰 Payment Success! Order #${id.slice(0,6)}`,
          amount: data.total,
          orderId: id,
          createdAt: serverTimestamp(),
        });

        window.open(`https://wa.me/${adminMobile}?text=${encodeURIComponent(adminMsg)}`, "_blank");

        setDone(true);
        setVerifying(false);
      }catch(err){ 
        console.log("Error:",err); 
        setVerifying(false);
      }
    };

    handle();
  },[id,done]);

  return(
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-emerald-200 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl text-center max-w-md w-full">
            
            {verifying ? (
              <div className="py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-sm font-bold text-slate-600">Verifying Your Payment...</p>
              </div>
            ) : (
              <>
                <div className="text-5xl mb-3">✅</div>
                <h1 className="text-green-600 text-2xl font-bold">Payment Successful 🎉</h1>
                <p className="mt-2 text-sm text-gray-600">Your order has been placed successfully</p>
                <div className="mt-4 bg-gray-100 p-3 rounded-xl text-sm">Order ID: <span className="font-bold">{id}</span></div>
                {order && <p className="mt-2 font-semibold text-lg text-green-700">Total: ₹{order.total}</p>}
                <div className="flex gap-3 mt-6">
                    <button onClick={()=>router.push(`/orders/${id}`)} className="flex-1 bg-black text-white py-2 rounded-xl font-bold text-sm">Track Order</button>
                    <button onClick={()=>router.push("/")} className="flex-1 bg-gray-200 py-2 rounded-xl font-bold text-sm">Shop More</button>
                </div>
              </>
            )}
        </div>
    </div>
  );
}

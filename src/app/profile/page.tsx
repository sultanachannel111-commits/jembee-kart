"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export default function ProfilePage(){

  const [user,setUser] = useState<any>(null);
  const [userData,setUserData] = useState<any>({});
  const [orders,setOrders] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);

  /* 🔄 LOAD USER */
  useEffect(()=>{

    const unsub = onAuthStateChanged(auth, async(u)=>{
      if(!u) return;

      setUser(u);

      /* 👤 USER DATA */
      const snap = await getDoc(doc(db,"users",u.uid));

      if(snap.exists()){
        setUserData(snap.data());
      }

      /* 📦 ORDERS */
      const orderSnap = await getDocs(collection(db,"orders"));

      const arr:any[] = [];

      orderSnap.forEach(doc=>{
        const d:any = doc.data();

        if(d.userId === u.uid){
          arr.push({
            id:doc.id,
            ...d
          });
        }
      });

      setOrders(arr);

      setLoading(false);
    });

    return ()=>unsub();

  },[]);

  if(loading){
    return <div className="p-6 text-center">Loading...</div>;
  }

  return(
<div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 p-4">

<h1 className="text-2xl font-bold text-center mb-4">
My Profile 👤
</h1>

{/* USER INFO */}
<div className="bg-white/60 backdrop-blur p-4 rounded-2xl shadow space-y-2">

<p><b>Name:</b> {userData?.address?.firstName || "❌ Missing"}</p>
<p><b>Phone:</b> {userData?.address?.phone || "❌ Missing"}</p>
<p><b>Address:</b> {userData?.address?.address || "❌ Missing"}</p>

</div>

{/* ORDERS */}
<div className="mt-4 space-y-3">

<h2 className="font-bold text-lg">My Orders 📦</h2>

{orders.length === 0 && (
<p className="text-gray-500">No orders found ❌</p>
)}

{orders.map(o=>(
<div key={o.id}
className="bg-white/60 backdrop-blur p-3 rounded-xl shadow">

<p><b>Order ID:</b> {o.id}</p>
<p><b>Total:</b> ₹{o.total}</p>
<p><b>Status:</b> {o.status || "Placed"}</p>

</div>
))}

</div>

{/* 🐞 DEBUG PANEL */}
<div className="mt-6 bg-black text-green-400 p-3 rounded-xl text-xs overflow-auto">

<h3 className="text-white mb-2">DEBUG DATA 🔍</h3>

<pre>
{JSON.stringify({
  firebaseUser:user,
  userData,
  orders
},null,2)}
</pre>

</div>

</div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ProfilePage(){

  const router = useRouter();

  const [user,setUser] = useState<any>(null);
  const [orders,setOrders] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);

  const [name,setName] = useState("");
  const [wallet,setWallet] = useState(0);

  /* 🔐 AUTH + LOAD */
  useEffect(()=>{

    let unsubOrders:any;

    const unsub = onAuthStateChanged(auth, async(u)=>{

      if(!u){
        router.push("/login");
        return;
      }

      setUser(u);

      // 👤 USER DATA
      const userSnap = await getDoc(doc(db,"users",u.uid));

      if(userSnap.exists()){
        const d:any = userSnap.data();
        setName(d?.name || d?.address?.firstName || "User");
        setWallet(d?.wallet || 0);
      }

      // 📦 ORDERS
      const q = query(
        collection(db,"orders"),
        where("userId","==",u.uid)
      );

      unsubOrders = onSnapshot(q,(snap)=>{

        const arr:any[] = [];

        snap.forEach(doc=>{
          arr.push({
            id:doc.id,
            ...doc.data()
          });
        });

        setOrders(arr);
        setLoading(false);

      });

    });

    return ()=>{
      unsub();
      if(unsubOrders) unsubOrders();
    };

  },[]);

  if(loading) return <div className="p-5">Loading...</div>;

  return(
<div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white">

{/* 🔝 HEADER */}
<div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-5 rounded-b-3xl shadow-lg">
  <h1 className="text-xl font-bold">My Profile</h1>
</div>

<div className="p-4 space-y-4">

{/* 👤 USER */}
<div className="bg-white/70 backdrop-blur p-4 rounded-2xl shadow flex items-center gap-3">

  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center">
    {user?.email?.charAt(0)?.toUpperCase()}
  </div>

  <div>
    <p className="font-semibold">{name}</p>
    <p className="text-xs text-gray-500">{user?.email}</p>
  </div>

</div>

{/* 💰 WALLET */}
<div className="bg-white/70 backdrop-blur p-4 rounded-xl shadow flex justify-between">
  <p>Wallet</p>
  <p className="text-green-600 font-bold">₹{wallet}</p>
</div>

{/* 📦 ORDERS */}
<div>

<h3 className="font-semibold mb-2">My Orders</h3>

{orders.length === 0 && (
  <p className="text-gray-500">No orders yet</p>
)}

{orders.map(order=>(
<div key={order.id}
className="bg-white/80 backdrop-blur p-4 rounded-xl shadow mb-3">

<p className="text-xs text-gray-400">
Order ID: {order.id.slice(0,8)}
</p>

{/* ITEMS */}
{order.items?.map((item:any,i:number)=>(
<div key={i}
className="flex gap-3 mt-3 border-t pt-3">

<img
src={item.image || "/no.png"}
className="w-16 h-16 rounded-lg"
/>

<div className="flex-1">

<p className="font-medium text-sm">
{item.name}
</p>

<p className="text-green-600 font-bold">
₹{item.price}
</p>

<p className="text-xs">
Qty: {item.quantity}
</p>

{/* 🔥 IMPORTANT FIX */}
<button
onClick={()=>
router.push(`/product/${item.productId || item.id}`)
}
className="text-blue-600 text-xs mt-1"
>
View Product
</button>

</div>

</div>
))}

<p className="font-bold mt-3">
Total: ₹{order.total}
</p>

</div>
))}

</div>

{/* 🚪 LOGOUT */}
<button
onClick={async()=>{
  await signOut(auth);
  router.push("/");
}}
className="w-full bg-red-500 text-white py-3 rounded-xl"
>
Logout
</button>

</div>
</div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

/* PRICE */
const getFinalPrice = (item:any) => {
  const base =
    Number(item?.variations?.[0]?.sizes?.[0]?.sellPrice ?? item?.price ?? 0);

  const discount = Number(item?.discount ?? 0);

  return discount > 0
    ? Math.round(base - (base * discount)/100)
    : base;
};

export default function CheckoutPage(){

  const router = useRouter();

  const [items,setItems] = useState<any[]>([]);
  const [user,setUser] = useState<any>(null);

  const [payment,setPayment] = useState("online");

  const [shippingConfig,setShippingConfig] = useState({
    prepaid:40,
    cod:60
  });

  const [customer,setCustomer] = useState({
    firstName:"",
    phone:"",
    address:""
  });

  /* LOAD */
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async (u)=>{
      if(!u) return;

      setUser(u);

      const snap = await getDocs(collection(db,"carts",u.uid,"items"));

      const arr:any[] = [];

      snap.forEach(doc=>{
        const d = doc.data();
        arr.push({...d, quantity:d.quantity||1});
      });

      setItems(arr);

      const shipDoc = await getDoc(doc(db,"config","shipping"));
      if(shipDoc.exists()){
        setShippingConfig(shipDoc.data());
      }

    });

    return ()=>unsub();
  },[]);

  /* TOTAL */
  const total = items.reduce(
    (sum,i)=> sum + getFinalPrice(i)*(i.quantity||1),
    0
  );

  const shippingCharge =
    payment==="cod" ? shippingConfig.cod : shippingConfig.prepaid;

  const grandTotal = total + shippingCharge;

  /* ORDER */
  const placeOrder = async()=>{
    await addDoc(collection(db,"orders"),{
      items,
      total: grandTotal,
      createdAt:serverTimestamp()
    });

    router.push("/order-success");
  };

  return(

<div className="min-h-screen bg-gray-100 pb-28">

<div className="max-w-xl mx-auto">

{/* 🛒 PRODUCT LIST */}
<div className="bg-white p-4 mt-3 rounded-xl shadow">

<h2 className="font-semibold mb-3">Order Summary</h2>

{items.length===0 && (
  <p className="text-red-500 text-sm">Cart Empty</p>
)}

{items.map((i,index)=>{

  const price = getFinalPrice(i);

  return(
    <div key={index} className="flex gap-3 border-b py-3">

      <img src={i.image} className="w-16 h-16 rounded object-cover"/>

      <div className="flex-1">
        <p className="text-sm font-medium">{i.name}</p>
        <p className="text-xs text-gray-500">Qty: {i.quantity}</p>
      </div>

      <p className="font-semibold">
        ₹{price * i.quantity}
      </p>

    </div>
  );

})}

</div>

{/* 🚚 DELIVERY */}
<div className="bg-white p-4 mt-3 rounded-xl shadow text-sm">
  🚚 Delivery in 5 days
</div>

{/* 💳 PAYMENT */}
<div className="bg-white p-4 mt-3 rounded-xl shadow space-y-3">

{/* COD */}
<div
onClick={()=>setPayment("cod")}
className={`p-3 border rounded-lg flex justify-between ${payment==="cod"?"border-pink-500":""}`}
>
  <p>Cash on Delivery</p>
  <span>₹{shippingConfig.cod}</span>
</div>

{/* ONLINE */}
<div
onClick={()=>setPayment("online")}
className={`p-3 border rounded-lg flex justify-between ${payment==="online"?"border-pink-500":""}`}
>
  <p>Pay Online</p>
  <span>₹{shippingConfig.prepaid}</span>
</div>

</div>

{/* 📦 ADDRESS */}
<div className="bg-white p-4 mt-3 rounded-xl shadow space-y-2">

<input placeholder="Name" className="w-full border p-2 rounded"
value={customer.firstName}
onChange={(e)=>setCustomer({...customer,firstName:e.target.value})}
/>

<input placeholder="Phone" className="w-full border p-2 rounded"
value={customer.phone}
onChange={(e)=>setCustomer({...customer,phone:e.target.value})}
/>

<textarea placeholder="Address" className="w-full border p-2 rounded"
value={customer.address}
onChange={(e)=>setCustomer({...customer,address:e.target.value})}
/>

</div>

</div>

{/* 🔥 BOTTOM BAR */}
<div className="fixed bottom-0 w-full bg-white border-t p-4 flex justify-between items-center">

<div>
  <p className="text-sm">Items: ₹{total}</p>
  <p className="text-sm">Shipping: ₹{shippingCharge}</p>
  <p className="font-bold text-lg">₹{grandTotal}</p>
</div>

<button
onClick={placeOrder}
className="bg-pink-500 text-white px-6 py-3 rounded-xl"
>
Place Order
</button>

</div>

</div>
  );
}

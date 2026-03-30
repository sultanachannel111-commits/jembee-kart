"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function CheckoutPage() {

  const [items,setItems] = useState<any[]>([]);
  const [user,setUser] = useState<any>(null);

  const [shipping,setShipping] = useState({
    prepaid: 0,
    cod: 50
  });

  const [cod,setCod] = useState(false);

  const [customer,setCustomer] = useState({
    name:"",
    phone:"",
    address:""
  });

  /* 🔥 LOAD DATA */
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async (u)=>{
      if(!u) return;

      setUser(u);

      // CART
      const snap = await getDocs(collection(db,"carts",u.uid,"items"));
      const arr:any[] = [];
      snap.forEach(doc=>{
        arr.push(doc.data());
      });
      setItems(arr);

      // ADDRESS
      const userDoc = await getDoc(doc(db,"users",u.uid));
      if(userDoc.exists()){
        setCustomer(userDoc.data().address || {});
      }

      // SHIPPING CONFIG
      const shipDoc = await getDoc(doc(db,"config","shipping"));
      if(shipDoc.exists()){
        setShipping(shipDoc.data());
      }

    });

    return ()=>unsub();
  },[]);

  /* 💰 PRICE */
  const getPrice = (item:any)=>{
    const sell =
      item?.variations?.[0]?.sizes?.[0]?.sellPrice ||
      item.price || 0;

    const discount = item.discount || 0;

    return discount > 0
      ? Math.round(sell - (sell * discount)/100)
      : sell;
  };

  const itemTotal = items.reduce(
    (sum,i)=> sum + getPrice(i),
    0
  );

  const originalTotal = items.reduce((sum,i)=>{
    const p =
      item?.variations?.[0]?.sizes?.[0]?.sellPrice ||
      item.price || 0;
    return sum + p;
  },0);

  const save = originalTotal - itemTotal;

  const shippingCharge = cod ? shipping.cod : shipping.prepaid;

  const finalPay = itemTotal + shippingCharge;

  return(

<div className="bg-gray-100 min-h-screen pb-32">

<div className="max-w-xl mx-auto p-4 space-y-4">

{/* 🏠 ADDRESS */}
<div className="bg-white p-4 rounded-xl shadow">
  <h2 className="font-semibold mb-2">Delivery Address</h2>

  <p className="font-medium">{customer.name}</p>
  <p className="text-sm">{customer.phone}</p>
  <p className="text-sm text-gray-600">{customer.address}</p>
</div>

{/* 🛒 ITEMS */}
<div className="bg-white p-4 rounded-xl shadow">
  <h2 className="font-semibold mb-3">Order Items</h2>

  {items.map((item,i)=>(
    <div key={i} className="flex justify-between text-sm mb-2">
      <span>{item.name}</span>
      <span>₹{getPrice(item)}</span>
    </div>
  ))}
</div>

{/* 💰 PRICE DETAILS */}
<div className="bg-white p-4 rounded-xl shadow">

  <h2 className="font-semibold mb-3">Price Details</h2>

  <div className="flex justify-between text-sm mb-1">
    <span>Item Total</span>
    <span>₹{originalTotal}</span>
  </div>

  <div className="flex justify-between text-green-600 text-sm mb-1">
    <span>You Saved</span>
    <span>-₹{save}</span>
  </div>

  <div className="flex justify-between text-sm mb-1">
    <span>Shipping</span>
    <span>
      {shippingCharge > 0 ? `₹${shippingCharge}` : "FREE 🚚"}
    </span>
  </div>

  <div className="border-t mt-2 pt-2 flex justify-between font-bold">
    <span>Total</span>
    <span>₹{finalPay}</span>
  </div>

</div>

{/* 💳 PAYMENT */}
<div className="bg-white p-4 rounded-xl shadow">

  <h2 className="font-semibold mb-3">Payment Method</h2>

  <div
    onClick={()=>setCod(false)}
    className={`p-3 border rounded mb-2 ${
      !cod ? "border-green-500" : ""
    }`}
  >
    Online Payment (Free Delivery)
  </div>

  <div
    onClick={()=>setCod(true)}
    className={`p-3 border rounded ${
      cod ? "border-green-500" : ""
    }`}
  >
    Cash on Delivery (+₹{shipping.cod})
  </div>

</div>

</div>

{/* 🔥 STICKY PAY BAR */}
<div className="fixed bottom-0 left-0 w-full bg-white border-t p-3 flex justify-between items-center">

  <div>
    <p className="text-sm text-gray-500">Total Amount</p>
    <p className="font-bold text-lg">₹{finalPay}</p>
  </div>

  <button className="bg-green-600 text-white px-6 py-3 rounded-xl">
    Continue
  </button>

</div>

</div>
  );
}

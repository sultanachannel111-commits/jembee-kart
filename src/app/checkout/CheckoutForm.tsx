"use client";

import { useEffect, useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import { auth, db } from "@/lib/firebase";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

export default function CheckoutPage(){

  const [items,setItems] = useState<any[]>([]);
  const [user,setUser] = useState<any>(null);
  const [loading,setLoading] = useState(false);
  const [codMode,setCodMode] = useState(false);

  const [shipping,setShipping] = useState({
    prepaid: 0,
    cod: 50
  });

  const [customer,setCustomer] = useState({
    firstName:"",
    phone:"",
    address:""
  });

  /* 🔥 LOAD DATA */
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async (u)=>{
      if(!u) return;

      setUser(u);

      // 📦 CART LOAD
      const snap = await getDocs(collection(db,"carts",u.uid,"items"));
      const arr:any[] = [];

      snap.forEach(doc=>{
        arr.push({
          id:doc.id,
          ...doc.data(),
          quantity: doc.data().quantity || 1
        });
      });

      setItems(arr);

      // 🚚 SHIPPING CONFIG
      const shipDoc = await getDoc(doc(db,"config","shipping"));
      if(shipDoc.exists()){
        setShipping(shipDoc.data());
      }

      // 👤 ADDRESS
      const userDoc = await getDoc(doc(db,"users",u.uid));
      if(userDoc.exists()){
        const data = userDoc.data();
        if(data.address){
          setCustomer(data.address);
        }
      }

    });

    return ()=>unsub();
  },[]);

  /* 💰 PRICE FUNCTION */
  const getPrice = (item:any)=>{
    return (
      item.price ||
      item?.variations?.[0]?.sizes?.[0]?.sellPrice ||
      0
    );
  };

  /* 💰 TOTAL */
  const total = items.reduce(
    (sum,i)=> sum + getPrice(i)*(i.quantity||1),
    0
  );

  /* 💸 ORIGINAL */
  const originalTotal = items.reduce((sum,i)=>{
    const p =
      i?.originalPrice ||
      i?.variations?.[0]?.sizes?.[0]?.sellPrice ||
      getPrice(i);

    return sum + p*(i.quantity||1);
  },0);

  const discount = originalTotal - total;

  /* 🚚 SHIPPING */
  const shippingCharge = codMode ? shipping.cod : shipping.prepaid;

  const finalPay = total + shippingCharge;

  /* 💾 SAVE ADDRESS */
  const saveAddress = async ()=>{
    if (!user) return;

    await setDoc(doc(db, "users", user.uid), {
      address: customer
    }, { merge: true });
  };

  /* 💳 ONLINE */
  const placeOrder = async()=>{
    setCodMode(false);

    if(!customer.firstName || !customer.phone){
      alert("Fill details");
      return;
    }

    await saveAddress();
    setLoading(true);

    const res = await fetch("/api/cashfree/create-order",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        orderId:"order_"+Date.now(),
        amount: finalPay,
        customer
      })
    });

    const data = await res.json();

    const cashfree = await load({ mode:"production" });

    await cashfree.checkout({
      paymentSessionId:data.payment_session_id,
      redirectTarget:"_self"
    });

    setLoading(false);
  };

  /* 🚚 COD */
  const placeCOD = async()=>{
    setCodMode(true);

    if(!customer.firstName || !customer.phone){
      alert("Fill details");
      return;
    }

    await saveAddress();
    setLoading(true);

    await addDoc(collection(db,"orders"),{
      userId:user.uid,
      items,
      total: finalPay,
      paymentMethod:"cod",
      status:"placed",
      createdAt:serverTimestamp()
    });

    alert("Order placed ✅");
    setLoading(false);
  };

  if(!items) return null;

  return(
<div className="min-h-screen bg-gray-100 pb-28">

<div className="max-w-xl mx-auto p-4 space-y-4">

{/* 🧾 SUMMARY */}
<div className="bg-white rounded-xl p-4 shadow">

<h2 className="font-semibold mb-3 text-lg">
Order Summary
</h2>

{items.map(item=>(
  <div key={item.id} className="flex justify-between text-sm mb-2">
    <span>{item.name} × {item.quantity}</span>
    <span>₹{getPrice(item)*(item.quantity||1)}</span>
  </div>
))}

<div className="text-sm mt-2">
<span className="line-through text-gray-400">
₹{originalTotal}
</span>{" "}
<span className="text-green-600 font-medium">
Save ₹{discount}
</span>
</div>

<div className="flex justify-between mt-3 text-sm">
  <span>Shipping</span>
  <span className="text-green-600">
    {shippingCharge > 0 ? `₹${shippingCharge}` : "FREE 🚚"}
  </span>
</div>

<div className="border-t mt-3 pt-3 flex justify-between font-bold text-xl">
  <span>Total</span>
  <span>₹{finalPay}</span>
</div>

</div>

{/* 🚚 ADDRESS */}
<div className="bg-white rounded-xl p-4 shadow space-y-3">

<h2 className="font-semibold text-lg">
Delivery Details
</h2>

<input
placeholder="Full Name"
className="w-full p-2 border rounded"
value={customer.firstName}
onChange={(e)=>setCustomer({...customer,firstName:e.target.value})}
/>

<input
placeholder="Phone"
className="w-full p-2 border rounded"
value={customer.phone}
onChange={(e)=>setCustomer({...customer,phone:e.target.value})}
/>

<textarea
placeholder="Address"
className="w-full p-2 border rounded"
value={customer.address}
onChange={(e)=>setCustomer({...customer,address:e.target.value})}
/>

</div>

</div>

{/* 🔥 FIXED BOTTOM BAR (MEESHO STYLE) */}
<div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 space-y-2">

<div className="flex justify-between text-lg font-bold">
  <span>₹{finalPay}</span>
  <span className="text-green-600 text-sm">
    {shippingCharge === 0 ? "Free Delivery" : ""}
  </span>
</div>

<button
onClick={placeOrder}
className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold"
>
{loading ? "Processing..." : `Pay ₹${finalPay}`}
</button>

<button
onClick={placeCOD}
className="w-full py-3 rounded-xl bg-black text-white"
>
Cash on Delivery (+₹{shipping.cod})
</button>

</div>

</div>
  );
}

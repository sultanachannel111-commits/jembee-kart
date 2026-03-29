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
import { getFinalPrice } from "@/utils/getFinalPrice";

export default function CheckoutPage(){

  const [items,setItems] = useState<any[]>([]);
  const [user,setUser] = useState<any>(null);
  const [loading,setLoading] = useState(false);
  const [codUnlocked,setCodUnlocked] = useState(true);
  const [codChecked, setCodChecked] = useState(false);
  const [offers, setOffers] = useState<any>({});

  const [customer,setCustomer] = useState({
    firstName:"",
    lastName:"",
    address:"",
    city:"",
    state:"",
    zip:"",
    phone:"",
    email:""
  });

  const refCode =
    typeof window !== "undefined"
      ? localStorage.getItem("affiliate")
      : null;

  /* 🔥 LOAD */
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async (u)=>{
      if(!u) return;

      setUser(u);

      // address autofill
      const userDoc = await getDoc(doc(db, "users", u.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.address) setCustomer(data.address);
      }

      // offers
      const offerSnap = await getDocs(collection(db, "offers"));
      const offerMap:any = {};
      offerSnap.forEach(doc => {
        const d = doc.data();
        offerMap[d.productId] = d.discount;
      });
      setOffers(offerMap);

      // cart
      const snap = await getDocs(collection(db,"carts",u.uid,"items"));
      const data:any[] = [];

      snap.forEach(doc=>{
        const d = doc.data();
        data.push({
          id:doc.id,
          ...d,
          quantity: d.quantity || 1
        });
      });

      setItems(data);
    });

    return ()=>unsub();
  },[]);

  /* 💰 TOTAL */
  const total = items.reduce(
    (sum,i)=> sum + (getFinalPrice(i, offers)*(i.quantity||1)),
    0
  );

  /* 💸 DISCOUNT */
  const discount = items.reduce((sum,item)=>{
    const base =
      item?.variations?.[0]?.sizes?.[0]?.price || 0;

    const sell =
      item?.variations?.[0]?.sizes?.[0]?.sellPrice ||
      getFinalPrice(item, offers);

    return sum + Math.max(0, base - sell);
  },0);

  const originalTotal = total + discount;

  const discountPercent =
    originalTotal > 0
      ? Math.round((discount / originalTotal) * 100)
      : 0;

  /* 🚚 SHIPPING */
  const shippingTotal = items.reduce(
    (sum,i)=> sum + ((i.shippingCharge||0)*(i.quantity||1)),
    0
  );

  const codTotal = total + shippingTotal;

  /* 💾 SAVE */
  const saveAddress = async ()=>{
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), {
      address: customer
    }, { merge: true });
  };

  /* 💳 ONLINE */
  const placeOrder = async()=>{
    setCodChecked(false);

    if(!customer.firstName || !customer.phone){
      alert("Please fill details");
      return;
    }

    await saveAddress();
    setLoading(true);

    const res = await fetch("/api/cashfree/create-order",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        orderId:"order_"+Date.now(),
        amount: total,
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
    setCodChecked(true);

    if(!customer.firstName || !customer.phone){
      alert("Please fill details");
      return;
    }

    await saveAddress();
    setLoading(true);

    await addDoc(collection(db,"orders"),{
      userId: user.uid,
      items,
      total: codTotal,
      customer,
      paymentMethod:"cod",
      paymentStatus:"pending",
      status:"placed",
      createdAt:serverTimestamp()
    });

    alert("Order placed (COD) ✅");
    setLoading(false);
  };

  return(
<div className="min-h-screen bg-gray-100 pb-24">

<div className="max-w-xl mx-auto p-4">

{/* 🔥 SUMMARY */}
<div className="bg-white rounded-xl p-4 mb-4 shadow">

<h2 className="font-semibold mb-3">Order Summary</h2>

{items.map(item => (
  <div key={item.id} className="flex justify-between text-sm mb-2">
    <span>{item.name} × {item.quantity}</span>
    <span>₹{getFinalPrice(item, offers)*(item.quantity||1)}</span>
  </div>
))}

<div className="text-xs text-gray-500 mt-2">
<span className="line-through">₹{originalTotal}</span>{" "}
<span className="text-green-600">
{discountPercent}% OFF ₹{discount}
</span>
</div>

<div className="flex justify-between mt-3 text-sm">
  <span>Shipping</span>
  <span className="text-green-600">
    {shippingTotal > 0 ? `₹${shippingTotal}` : "FREE 🚚"}
  </span>
</div>

<div className="border-t mt-3 pt-3 flex justify-between font-bold text-lg">
  <span>Total</span>
  <span>₹{codChecked ? codTotal : total}</span>
</div>

</div>

{/* 🔥 FORM */}
<div className="bg-white rounded-xl shadow p-4 space-y-3">

<h2 className="font-semibold">Delivery Details</h2>

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

{/* 🔥 BUTTON */}
<button
onClick={placeOrder}
className="w-full py-4 rounded-xl text-white font-semibold bg-green-600"
>
{loading ? "Processing..." : `Pay ₹${codChecked ? codTotal : total}`}
</button>

<button
onClick={placeCOD}
className="w-full py-3 rounded-xl text-white bg-black"
>
Cash on Delivery
</button>

{/* 🔥 DISCOUNT UI */}
{discount > 0 && (
<div className="text-center text-sm mt-3">

<div>
<span className="line-through">₹{originalTotal}</span>{" "}
<span className="text-green-600 font-semibold">
{discountPercent}% OFF
</span>{" "}
₹{discount}
</div>

<div className="text-green-600 mt-1">
{codChecked
  ? (shippingTotal > 0
      ? `Delivery ₹${shippingTotal}`
      : "Free Delivery 🚚")
  : "Free Delivery ⚡"}
</div>

</div>
)}

</div>

</div>
</div>
  );
}

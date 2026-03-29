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

  /* 🔥 LOAD */
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async (u)=>{
      if(!u) return;

      setUser(u);

      // address autofill
      const userDoc = await getDoc(doc(db,"users",u.uid));
      if(userDoc.exists()){
        const d = userDoc.data();
        if(d.address) setCustomer(d.address);
      }

      // offers
      const snap = await getDocs(collection(db,"offers"));
      const map:any = {};
      snap.forEach(doc=>{
        const d = doc.data();
        map[d.productId] = d.discount;
      });
      setOffers(map);

      // cart
      const cartSnap = await getDocs(collection(db,"carts",u.uid,"items"));
      const data:any[]=[];
      cartSnap.forEach(doc=>{
        const d = doc.data();
        data.push({
          id:doc.id,
          ...d,
          quantity:d.quantity || 1
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
    if(!user) return;
    await setDoc(doc(db,"users",user.uid),{address:customer},{merge:true});
  };

  /* 💳 ONLINE */
  const placeOrder = async()=>{
    setCodChecked(false);

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
        amount: total,
        customer
      })
    });

    const data = await res.json();

    const cashfree = await load({mode:"production"});
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
      alert("Fill details");
      return;
    }

    await saveAddress();
    setLoading(true);

    await addDoc(collection(db,"orders"),{
      userId:user.uid,
      items,
      total:codTotal,
      customer,
      paymentMethod:"cod",
      status:"placed",
      createdAt:serverTimestamp()
    });

    alert("Order placed ✅");
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

{/* 🔥 PAYMENT BOX */}
<div className="bg-white p-4 rounded-xl shadow mb-4">

<h2 className="font-semibold mb-2">Payment</h2>

{/* ONLINE */}
<div
onClick={()=>setCodChecked(false)}
className={`p-3 border rounded mb-2 cursor-pointer ${
!codChecked && "border-green-500"
}`}
>
<div className="flex justify-between">
<span>₹{total} Pay Online 💳</span>
<input type="radio" checked={!codChecked} readOnly />
</div>

<div className="text-xs mt-1 text-gray-600">
<span className="line-through">₹{originalTotal}</span>{" "}
<span className="text-green-600">
{discountPercent}% OFF ₹{discount}
</span>
</div>

<div className="text-green-600 text-xs">
Free Delivery
</div>
</div>

{/* COD */}
<div
onClick={()=>setCodChecked(true)}
className={`p-3 border rounded cursor-pointer ${
codChecked && "border-green-500"
}`}
>
<div className="flex justify-between">
<span>₹{codTotal} Cash on Delivery 🚚</span>
<input type="radio" checked={codChecked} readOnly />
</div>

<div className="text-xs mt-1 text-gray-600">
<span className="line-through">₹{originalTotal}</span>{" "}
<span className="text-green-600">
{discountPercent}% OFF ₹{discount}
</span>
</div>

<div className="text-green-600 text-xs">
{shippingTotal > 0 ? `Delivery ₹${shippingTotal}` : "Free Delivery"}
</div>
</div>

</div>

{/* 🔥 ADDRESS */}
<div className="bg-white p-4 rounded-xl shadow space-y-2">

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

</div>

{/* 🔥 BUTTON */}
<div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-between items-center">

<div className="font-bold text-lg">
₹{codChecked ? codTotal : total}
</div>

<button
onClick={codChecked ? placeCOD : placeOrder}
className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl"
>
{loading ? "Processing..." : "Place Order"}
</button>

</div>

</div>
</div>
  );
}

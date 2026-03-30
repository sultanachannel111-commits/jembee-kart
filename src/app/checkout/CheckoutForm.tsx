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

/* 🔥 FINAL PRICE FUNCTION */
const getFinalPrice = (item:any) => {
  const sellPrice =
    item?.variations?.[0]?.sizes?.[0]?.sellPrice ||
    item.price ||
    0;

  const discount = item.discount || 0;

  return discount > 0
    ? Math.round(sellPrice - (sellPrice * discount) / 100)
    : sellPrice;
};

export default function CheckoutPage(){

  const [items,setItems] = useState<any[]>([]);
  const [user,setUser] = useState<any>(null);
  const [loading,setLoading] = useState(false);
  const [codChecked,setCodChecked] = useState(false);

  const [shippingConfig,setShippingConfig] = useState({
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

      // address
      const userDoc = await getDoc(doc(db, "users", u.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.address) setCustomer(data.address);
      }

      // cart
      const snap = await getDocs(collection(db,"carts",u.uid,"items"));
      const arr:any[] = [];
      snap.forEach(doc=>{
        arr.push({ id:doc.id, ...doc.data(), quantity:1 });
      });
      setItems(arr);

      // 🔥 shipping config from admin
      const shipDoc = await getDoc(doc(db,"config","shipping"));
      if(shipDoc.exists()){
        setShippingConfig(shipDoc.data());
      }

    });

    return ()=>unsub();
  },[]);

  /* 💰 TOTAL */
  const total = items.reduce(
    (sum,i)=> sum + getFinalPrice(i)*(i.quantity||1),
    0
  );

  /* 💸 DISCOUNT */
  const discount = items.reduce((sum,item)=>{
    const sell =
      item?.variations?.[0]?.sizes?.[0]?.sellPrice || 0;

    const final = getFinalPrice(item);

    return sum + Math.max(0, sell - final);
  },0);

  const originalTotal = total + discount;

  /* 🚚 SHIPPING */
  const shippingCharge = codChecked
    ? shippingConfig.cod
    : shippingConfig.prepaid;

  const finalPay = total + shippingCharge;

  /* 💾 SAVE ADDRESS */
  const saveAddress = async ()=>{
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), {
      address: customer
    }, { merge: true });
  };

  /* 💳 ONLINE PAYMENT */
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
    setCodChecked(true);

    if(!customer.firstName || !customer.phone){
      alert("Fill details");
      return;
    }

    await saveAddress();
    setLoading(true);

    await addDoc(collection(db,"orders"),{
      userId: user.uid,
      items,
      total: finalPay,
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
    <span>{item.name}</span>
    <span>₹{getFinalPrice(item)}</span>
  </div>
))}

<div className="text-xs text-gray-500 mt-2">
<span className="line-through">₹{originalTotal}</span>{" "}
<span className="text-green-600">
Save ₹{discount}
</span>
</div>

<div className="flex justify-between mt-3 text-sm">
  <span>Shipping</span>
  <span className="text-green-600">
    {shippingCharge > 0 ? `₹${shippingCharge}` : "FREE 🚚"}
  </span>
</div>

<div className="border-t mt-3 pt-3 flex justify-between font-bold text-lg">
  <span>Total</span>
  <span>₹{finalPay}</span>
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

{/* 💳 PREPAID */}
<button
onClick={placeOrder}
className="w-full py-4 rounded-xl text-white font-semibold bg-green-600"
>
{loading ? "Processing..." : `Pay ₹${finalPay}`}
</button>

{/* 🚚 COD */}
<button
onClick={placeCOD}
className="w-full py-3 rounded-xl text-white bg-black"
>
Cash on Delivery (+₹{shippingConfig.cod})
</button>

</div>

</div>
</div>
  );
}

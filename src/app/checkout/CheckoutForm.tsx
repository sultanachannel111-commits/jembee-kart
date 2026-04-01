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

  /* 🔥 LOAD */
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async (u)=>{
      if(!u) return;

      setUser(u);

      const userDoc = await getDoc(doc(db, "users", u.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.address) setCustomer(data.address);
      }

      const snap = await getDocs(collection(db,"carts",u.uid,"items"));
      const arr:any[] = [];

      snap.forEach(doc=>{
        const d = doc.data();
        arr.push({
          id: doc.id,
          name: d.name || "",
          price: d.price || 0,
          discount: d.discount || 0,
          variations: d.variations || [],
          quantity: d.quantity || 1,
          image: d.image || ""
        });
      });

      setItems(arr);

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
      item?.variations?.[0]?.sizes?.[0]?.sellPrice ||
      item.price ||
      0;

    const final = getFinalPrice(item);

    return sum + Math.max(0, sell - final);
  },0);

  const originalTotal = total + discount;

  /* 🚚 SHIPPING */
  const shippingCharge = codChecked
    ? shippingConfig.cod
    : shippingConfig.prepaid;

  const finalPay = total + shippingCharge;

  /* 💾 SAVE */
  const saveAddress = async ()=>{
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), {
      address: customer
    }, { merge: true });
  };

  /* 💳 PREPAID */
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
<div className="min-h-screen bg-gray-100 pb-32">

<div className="max-w-xl mx-auto p-4 space-y-4">

{/* 🧾 PRODUCT LIST (NEW - MEESHO STYLE) */}
<div className="bg-white rounded-xl p-4 shadow">

{items.map(item => (
  <div key={item.id} className="flex gap-3 mb-3">

    <img
      src={item.image || "/no-image.png"}
      className="w-16 h-16 rounded object-cover"
    />

    <div className="flex-1 text-sm">
      <p className="font-medium">{item.name}</p>

      <div className="flex justify-between mt-1">
        <span>Qty: {item.quantity}</span>
        <span className="font-semibold">
          ₹{getFinalPrice(item)}
        </span>
      </div>

    </div>
  </div>
))}

</div>

{/* 🔥 SUMMARY */}
<div className="bg-white rounded-xl p-4 shadow">

<h2 className="font-semibold mb-3">Price Details</h2>

<div className="flex justify-between text-sm mb-2">
  <span>Total MRP</span>
  <span>₹{originalTotal}</span>
</div>

<div className="flex justify-between text-sm mb-2 text-green-600">
  <span>Discount</span>
  <span>-₹{discount}</span>
</div>

<div className="flex justify-between text-sm mb-2">
  <span>Shipping</span>
  <span>{shippingCharge > 0 ? `₹${shippingCharge}` : "FREE"}</span>
</div>

<div className="border-t mt-2 pt-2 flex justify-between font-bold">
  <span>Total Amount</span>
  <span>₹{finalPay}</span>
</div>

</div>

{/* 🔥 ADDRESS */}
<div className="bg-white rounded-xl shadow p-4 space-y-3">

<h2 className="font-semibold">Delivery Address</h2>

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

<div className="flex justify-between font-bold text-lg">
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
Cash on Delivery (+₹{shippingConfig.cod})
</button>

</div>

</div>
  );
}

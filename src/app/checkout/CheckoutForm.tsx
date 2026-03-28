"use client";

import { useEffect, useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import { auth, db } from "@/lib/firebase";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
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
  const [codUnlocked,setCodUnlocked] = useState(false);
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

  /* 🔥 LOAD CART + BUY NOW FIXED */
  useEffect(()=>{

    const unsub = onAuthStateChanged(auth, async (u)=>{
      if(!u) return;

      setUser(u);
      // 🔥 AUTO LOAD ADDRESS
const userDoc = await getDoc(doc(db, "users", u.uid));

if (userDoc.exists()) {
  const data = userDoc.data();
  if (data.address) {
    setCustomer(data.address);
  }
}
      // 🔥 FETCH OFFERS
const offerSnap = await getDocs(collection(db, "offers"));

const offerMap:any = {};

offerSnap.forEach(doc => {
  const data = doc.data();
  offerMap[data.productId] = data.discount;
});

setOffers(offerMap);

      const buyNow = localStorage.getItem("buy-now");

      if(buyNow){
        const parsed = JSON.parse(buyNow);

        // ✅ FINAL PRICE FIX
  const finalPrice = getFinalPrice(parsed, offerMap);
        console.log("🔥 BUY NOW:", parsed);
        console.log("🔥 FINAL PRICE:", finalPrice);

        setItems([{
  ...parsed,
  quantity: parsed.quantity || 1
}]);

      } else {
        // 🛒 CART LOAD
        const snap = await getDocs(
          collection(db,"carts",u.uid,"items")
        );

        const data:any[] = [];

        snap.forEach(doc=>{
          const d = doc.data();
          console.log("🔥 FIRESTORE ITEM:", d); //
          const finalPrice = getFinalPrice(d, offerMap);
          data.push({
  id:doc.id,
  ...d,
  quantity: d.quantity || 1
});
        });

        setItems(data);
      }
    });

    return ()=>unsub();

  },[]);
  // 👇 YAHI ADD KARO
const saveAddress = async () => {
  if (!user) return;

  await setDoc(
    doc(db, "users", user.uid),
    {
      address: customer
    },
    { merge: true }
  );
};

/* 🔥 TOTAL SAFE */
const total = items.reduce(

  (sum,i)=> sum + (getFinalPrice(i, offers) * (i.quantity || 1)),
  0
);
  const discount = items.reduce((sum, item) => {
  const base =
    item?.variations?.[0]?.sizes?.[0]?.price || 0;

  const sell =
    item?.variations?.[0]?.sizes?.[0]?.sellPrice ||
   getFinalPrice(item, offers)

  return sum + Math.max(0, base - sell);
}, 0);
    // ✅ SHIPPING TOTAL (PRODUCT WISE)
const shippingTotal = items.reduce(
  (sum, item) => sum + ((item.shippingCharge || 0) * (item.quantity || 1)),
  0
);

// ✅ COD FINAL TOTAL
const codTotal = total + shippingTotal;
  /* 🔥 ONLINE PAYMENT */
  const placeOrder = async()=>{
    setCodChecked(false);
    if(customer.firstName && customer.phone){
  await saveAddress();
}

    if(!customer.firstName || !customer.phone){
      alert("Please fill details");
      return;
    }

    if(total <= 0){
      alert("Invalid amount ❌");
      return;
    }

    setLoading(true);
    // ✅ TEMP ORDER SAVE (IMPORTANT)
const tempOrder = {
  userId: user.uid,
  items,
  total,
  customer,
  paymentMethod: "online"
};

localStorage.setItem("temp-order", JSON.stringify(tempOrder));

    const res = await fetch("/api/cashfree/create-order",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        orderId: "temp_" + Date.now(),
        amount:total,
        customer
      })
    });

    const data = await res.json();

    if(!data.payment_session_id){
      alert("Payment failed ❌");
      setLoading(false);
      return;
    }

    const cashfree = await load({ mode:"production" });

    await cashfree.checkout({
      paymentSessionId:data.payment_session_id,
      redirectTarget:"_self"
    });

    // ✅ BUY NOW CLEAR
    localStorage.removeItem("buy-now");

    setLoading(false);
  };

  /* 🔥 COD ORDER */
  const placeCOD = async()=>{
    setCodChecked(true);
    if(customer.firstName && customer.phone){
  await saveAddress();
}

    let sellerId = null;

    if (refCode) {
      const snap = await getDoc(doc(db, "affiliateLinks", refCode));
      if (snap.exists()) {
        sellerId = snap.data().sellerId;
      }
    }

    if(!customer.firstName || !customer.phone){
      alert("Please fill details");
      return;
    }

    if(items.length === 0){
      alert("Cart empty ❌");
      return;
    }

    const firstItem = items[0];

    const sellPrice =
      firstItem?.variations?.[0]?.sizes?.[0]?.sellPrice ||
      firstItem?.price || 0;

    const basePrice =
      firstItem?.variations?.[0]?.sizes?.[0]?.basePrice || 0;

    const profit = sellPrice - basePrice;
    const commission = Math.max(0, Math.round(profit * 0.5));
const finalTotal = codTotal;
    setLoading(true);

    await addDoc(collection(db,"orders"),{

      userId: user.uid,
      productId: firstItem?.id,

      sellerId: sellerId || null,
      affiliateCode: refCode || null,

      sellPrice,
      basePrice,
      commission,

      items,
      total: finalTotal,
      customer,

      paymentMethod:"cod",
      paymentStatus:"pending",
      status:"placed",

      createdAt:serverTimestamp()
    });

    alert("Order placed (COD) ✅");

    // ✅ BUY NOW CLEAR
    localStorage.removeItem("buy-now");

    setLoading(false);
  };

  return(

    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 p-4">

      <div className="max-w-xl mx-auto">

        <h1 className="text-3xl font-bold text-center mb-4">
          Checkout 🛍️
        </h1>

        {/* 🔥 SUMMARY */}
        <div className="bg-white rounded-2xl shadow p-4 mb-4">

          <h2 className="font-semibold mb-3">Order Summary</h2>

          {items.map(item => (
  <div key={item.id} className="flex justify-between text-sm mb-2">
    <span>{item.name} × {item.quantity}</span>
    <span>₹{getFinalPrice(item, offers) * (item.quantity || 1)}</span>
  </div>
))}

<div className="flex justify-between text-sm mt-3">
  <span className="text-gray-600">Shipping</span>
  <span className="text-orange-600 font-semibold">
    {shippingTotal > 0 ? `₹${shippingTotal}` : "FREE 🚚"}
  </span>
</div>

{/* 🔥 TOTAL */}
<div className="border-t mt-3 pt-3 flex justify-between font-bold">
  <span className="text-lg text-green-600">
  ₹{codChecked ? codTotal : total}
</span>
</div>

        </div>

        {/* 🔥 FORM */}
        <div className="bg-white rounded-2xl shadow p-5 space-y-4">

          <h2 className="font-semibold">Delivery Details</h2>

          <div className="grid grid-cols-2 gap-3">
  <input
    value={customer.firstName}
    placeholder="First Name"
    className="p-3 rounded-xl border"
    onChange={(e)=>setCustomer({...customer,firstName:e.target.value})}
  />
  <input
    value={customer.lastName}
    placeholder="Last Name"
    className="p-3 rounded-xl border"
    onChange={(e)=>setCustomer({...customer,lastName:e.target.value})}
  />
</div>

<textarea
  value={customer.address}
  placeholder="Full Address"
  className="p-3 rounded-xl border w-full"
  onChange={(e)=>setCustomer({...customer,address:e.target.value})}
/>

<div className="grid grid-cols-2 gap-3">
  <input
    value={customer.city}
    placeholder="City"
    className="p-3 rounded-xl border"
    onChange={(e)=>setCustomer({...customer,city:e.target.value})}
  />
  <input
    value={customer.state}
    placeholder="State"
    className="p-3 rounded-xl border"
    onChange={(e)=>setCustomer({...customer,state:e.target.value})}
  />
</div>

<input
  value={customer.zip}
  placeholder="Pin Code"
  className="p-3 rounded-xl border w-full"
  onChange={(e)=>setCustomer({...customer,zip:e.target.value})}
/>

<input
  value={customer.phone}
  placeholder="Phone Number"
  className="p-3 rounded-xl border w-full"
  onChange={(e)=>setCustomer({...customer,phone:e.target.value})}
/>

<input
  value={customer.email}
  placeholder="Email"
  className="p-3 rounded-xl border w-full"
  onChange={(e)=>setCustomer({...customer,email:e.target.value})}
/>

          {/* 🔥 PAY */}
          <button
            onClick={placeOrder}
            className="w-full py-3 rounded-xl text-white font-semibold text-lg bg-gradient-to-r from-green-500 to-green-600 shadow-lg"
          >
            {loading
    ? "Processing..."
    : `Pay ₹${total} ${
        discount > 0
          ? `(Save ₹${totalSaving} = ₹${discount} discount + ₹${COD_CHARGE} COD)`
          : `(Save ₹${COD_CHARGE})`
      }`
  }
</button>

          {/* 🔥 COD */}
          <button
            onClick={placeCOD}
            disabled={!codUnlocked}
            className={`w-full py-3 rounded-xl text-white font-semibold text-lg ${
              codUnlocked
                ? "bg-black"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {codUnlocked
              ? "Cash on Delivery"
              : "COD Locked (2 prepaid orders required)"}
          </button>

        </div>

      </div>

    </div>
  );
}

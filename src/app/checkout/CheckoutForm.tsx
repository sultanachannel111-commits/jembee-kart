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
  getDoc
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

export default function CheckoutPage(){

  const [items,setItems] = useState<any[]>([]);
  const [user,setUser] = useState<any>(null);
  const [loading,setLoading] = useState(false);

  const [codUnlocked,setCodUnlocked] = useState(false); // 🔥 COD STATE

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
  const refCode = typeof window !== "undefined"
  ? localStorage.getItem("affiliate")
  : null;

  /* LOAD CART + COD CHECK */
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth,async(u)=>{
      if(!u) return;

      setUser(u);

      // 🛒 CART
      const snap = await getDocs(
        collection(db,"carts",u.uid,"items")
      );

      const data:any[] = [];
      snap.forEach(doc=>{
        data.push({ id:doc.id, ...doc.data() });
      });

      setItems(data);

      // 🔥 COD UNLOCK CHECK
      const orderSnap = await getDocs(
        query(
          collection(db,"orders"),
          where("userId","==",u.uid)
        )
      );

      const paidOrders = orderSnap.docs.filter(
        (doc:any)=> doc.data().paymentStatus === "success"
      );

      if(paidOrders.length >= 2){
        setCodUnlocked(true);
      }

    });

    return ()=>unsub();
  },[]);

  /* TOTAL */
  const total = items.reduce(
    (sum,i)=> sum + (Number(i.price) * (i.quantity || 1)),
    0
  );

  /* ONLINE PAYMENT */
  const placeOrder = async()=>{

    if(!customer.firstName || !customer.phone){
      alert("Please fill details");
      return;
    }

    setLoading(true);

    const orderRef = await addDoc(
      collection(db,"orders"),
      {
        userId:user.uid,
        items,
        total,
        customer,
        paymentMethod:"online",
        paymentStatus:"pending",
        status:"pending",
        createdAt:serverTimestamp()
      }
    );

    const res = await fetch("/api/cashfree/create-order",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        orderId:orderRef.id,
        amount:total,
        customer
      })
    });

    const data = await res.json();

    if(!data.payment_session_id){
      alert("Payment failed");
      setLoading(false);
      return;
    }

    const cashfree = await load({ mode:"production" });

    await cashfree.checkout({
      paymentSessionId:data.payment_session_id,
      redirectTarget:"_self"
    });

    setLoading(false);
  };

  /* 🔥 COD ORDER */
  const placeCOD = async()=>{
    let sellerId = null;

if (refCode) {
  const snap = await getDoc(doc(db, "affiliateLinks", refCode));

  if (snap.exists()) {
    sellerId = snap.data().sellerId;
  }
}

    // 🔒 DOUBLE SECURITY
    if(!codUnlocked){
      alert("COD locked ❌ Complete 2 prepaid orders first");
      return;
    }

    if(!customer.firstName || !customer.phone){
      alert("Please fill details");
      return;
    }
    let sellerId = null;

if (refCode) {
  const snap = await getDoc(doc(db, "affiliateLinks", refCode));

  if (snap.exists()) {
    sellerId = snap.data().sellerId;
  }
}
    const firstItem = items?.[0] || {};
if (!firstItem?.id) {
  alert("Cart empty ❌");
  return;
}
const sellPrice =
  firstItem?.variations?.[0]?.sizes?.[0]?.sellPrice || 0;

const basePrice =
  firstItem?.variations?.[0]?.sizes?.[0]?.basePrice || 0;

const profit = sellPrice - basePrice;

const commission = Math.round(profit * 0.5);

    setLoading(true);

    await addDoc(collection(db,"orders"),{

  userId: user.uid,

  productId: firstItem?.id,

  // 🔥 affiliate data
  sellerId: sellerId || null,
  affiliateCode: refCode || null,

  // 🔥 pricing
  sellPrice,
  basePrice,
  commission,

  items,
  total,
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

    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 p-4">

      <div className="max-w-xl mx-auto">

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-center mb-4">
          Checkout 🛍️
        </h1>

        {/* CART SUMMARY */}
        <div className="bg-white rounded-2xl shadow p-4 mb-4">

          <h2 className="font-semibold mb-3">Order Summary</h2>

          {items.map(item=>(
            <div key={item.id} className="flex justify-between text-sm mb-2">
              <span>{item.name} × {item.quantity}</span>
              <span>₹{item.price}</span>
            </div>
          ))}

          <div className="border-t mt-3 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-lg">₹{total}</span>
          </div>

        </div>

        {/* FORM */}
        <div className="bg-white rounded-2xl shadow p-5 space-y-4">

          <h2 className="font-semibold">Delivery Details</h2>

          <div className="grid grid-cols-2 gap-3">
            <input placeholder="First Name" className="p-3 rounded-xl border"
              onChange={(e)=>setCustomer({...customer,firstName:e.target.value})}
            />
            <input placeholder="Last Name" className="p-3 rounded-xl border"
              onChange={(e)=>setCustomer({...customer,lastName:e.target.value})}
            />
          </div>

          <textarea placeholder="Full Address" className="p-3 rounded-xl border w-full"
            onChange={(e)=>setCustomer({...customer,address:e.target.value})}
          />

          <div className="grid grid-cols-2 gap-3">
            <input placeholder="City" className="p-3 rounded-xl border"
              onChange={(e)=>setCustomer({...customer,city:e.target.value})}
            />
            <input placeholder="State" className="p-3 rounded-xl border"
              onChange={(e)=>setCustomer({...customer,state:e.target.value})}
            />
          </div>

          <input placeholder="Pin Code" className="p-3 rounded-xl border w-full"
            onChange={(e)=>setCustomer({...customer,zip:e.target.value})}
          />

          <input placeholder="Phone Number" className="p-3 rounded-xl border w-full"
            onChange={(e)=>setCustomer({...customer,phone:e.target.value})}
          />

          <input placeholder="Email" className="p-3 rounded-xl border w-full"
            onChange={(e)=>setCustomer({...customer,email:e.target.value})}
          />

          {/* PAY BUTTON */}
          <button
            onClick={placeOrder}
            className="w-full py-3 rounded-xl text-white font-semibold text-lg bg-gradient-to-r from-green-500 to-green-600 shadow-lg"
          >
            {loading ? "Processing..." : `Pay ₹${total}`}
          </button>

          {/* COD BUTTON */}
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

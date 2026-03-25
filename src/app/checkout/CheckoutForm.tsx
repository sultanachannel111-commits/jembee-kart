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
  updateDoc
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import {
  sendCustomerWhatsApp,
  sendSellerWhatsApp
} from "@/lib/whatsapp";

export default function CheckoutPage(){

  const [items,setItems] = useState<any[]>([]);
  const [user,setUser] = useState<any>(null);
  const [loading,setLoading] = useState(false);
  const [codUnlocked,setCodUnlocked] = useState(false);

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

  /* 🔥 LOAD CART */
  useEffect(()=>{

    const unsub = onAuthStateChanged(auth, async (u)=>{
      if(!u) return;

      setUser(u);

      const buyNow = localStorage.getItem("buy-now");

      if(buyNow){
        const parsed = JSON.parse(buyNow);

        const finalPrice =
          Number(parsed.price) ||
          parsed?.variations?.[0]?.sizes?.[0]?.sellPrice ||
          parsed?.variations?.[0]?.sizes?.[0]?.price ||
          0;

        setItems([{
          ...parsed,
          quantity: parsed.quantity || 1,
          price: Number(finalPrice)
        }]);

      } else {

        const snap = await getDocs(
          collection(db,"carts",u.uid,"items")
        );

        const data:any[] = [];

        snap.forEach(doc=>{
          const d = doc.data();

          const finalPrice =
            Number(d.price) ||
            d?.variations?.[0]?.sizes?.[0]?.sellPrice ||
            d?.variations?.[0]?.sizes?.[0]?.price ||
            0;

          data.push({
            id:doc.id,
            ...d,
            quantity: d.quantity || 1,
            price: Number(finalPrice)
          });
        });

        setItems(data);
      }

      // COD unlock
      const orderSnap = await getDocs(
        query(collection(db,"orders"), where("userId","==",u.uid))
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

  const total = items.reduce(
    (sum,i)=> sum + (Number(i.price) * (i.quantity || 1)),
    0
  );

  /* 🔥 COMMON WHATSAPP FUNCTION */
  const sendWhatsApp = async () => {

    let sellerPhone = "919876543210"; // 👉 change this

    if(refCode){
      const snap = await getDoc(doc(db,"affiliateLinks",refCode));
      if(snap.exists()){
        const sellerId = snap.data().sellerId;

        const sellerSnap = await getDoc(doc(db,"users",sellerId));
        if(sellerSnap.exists()){
          sellerPhone = sellerSnap.data().phone;
        }
      }
    }

    sendCustomerWhatsApp({ items, total, customer });

    sendSellerWhatsApp({
      items,
      total,
      customer,
      sellerPhone
    });
  };

  /* 🔥 ONLINE PAYMENT */
  const placeOrder = async()=>{

    if(!customer.firstName || !customer.phone){
      alert("Please fill details");
      return;
    }

    if(total <= 0){
      alert("Invalid amount ❌");
      return;
    }

    setLoading(true);

    const orderRef = await addDoc(collection(db,"orders"),{
      userId:user.uid,
      items,
      total,
      customer,
      paymentMethod:"online",
      paymentStatus:"pending",
      status:"pending",
      createdAt:serverTimestamp()
    });

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
      alert("Payment failed ❌");
      setLoading(false);
      return;
    }

    const cashfree = await load({ mode:"production" });

    await cashfree.checkout({
      paymentSessionId:data.payment_session_id,
      redirectTarget:"_self"
    });

    // 🔥 WhatsApp trigger
    await sendWhatsApp();

    localStorage.removeItem("buy-now");

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

    if(!codUnlocked){
      alert("COD locked ❌ Complete 2 prepaid orders first");
      return;
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
      total,
      customer,

      paymentMethod:"cod",
      paymentStatus:"pending",
      status:"placed",

      createdAt:serverTimestamp()
    });

    // 🔥 WhatsApp trigger
    await sendWhatsApp();

    alert("Order placed (COD) ✅");

    localStorage.removeItem("buy-now");

    setLoading(false);
  };

  return(

    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 p-4">

      <div className="max-w-xl mx-auto">

        <h1 className="text-3xl font-bold text-center mb-4">
          Checkout 🛍️
        </h1>

        {/* SUMMARY */}
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
            <span className="text-lg text-green-600">₹{total}</span>
          </div>

        </div>

        {/* FORM */}
        <div className="bg-white rounded-2xl shadow p-5 space-y-4">

          <h2 className="font-semibold">Delivery Details</h2>

          <input placeholder="First Name" className="p-3 rounded-xl border w-full"
            onChange={(e)=>setCustomer({...customer,firstName:e.target.value})}
          />

          <input placeholder="Phone Number" className="p-3 rounded-xl border w-full"
            onChange={(e)=>setCustomer({...customer,phone:e.target.value})}
          />

          <textarea placeholder="Address" className="p-3 rounded-xl border w-full"
            onChange={(e)=>setCustomer({...customer,address:e.target.value})}
          />

          {/* PAY */}
          <button
            onClick={placeOrder}
            className="w-full py-3 rounded-xl text-white font-semibold text-lg bg-green-600"
          >
            {loading ? "Processing..." : `Pay ₹${total}`}
          </button>

          {/* COD */}
          <button
            onClick={placeCOD}
            disabled={!codUnlocked}
            className={`w-full py-3 rounded-xl text-white font-semibold text-lg ${
              codUnlocked ? "bg-black" : "bg-gray-400"
            }`}
          >
            {codUnlocked ? "Cash on Delivery" : "COD Locked"}
          </button>

        </div>

      </div>

    </div>
  );
}

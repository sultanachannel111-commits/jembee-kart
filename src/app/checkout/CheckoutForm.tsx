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

  const sendWhatsApp = async () => {

    let sellerPhone = "91XXXXXXXXXX";

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

  const placeOrder = async()=>{

    if(!customer.firstName || !customer.phone){
      alert("Please fill details");
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

    await sendWhatsApp();

    localStorage.removeItem("buy-now");

    setLoading(false);
  };

  const placeCOD = async()=>{

    if(!codUnlocked){
      alert("COD locked ❌");
      return;
    }

    if(!customer.firstName || !customer.phone){
      alert("Please fill details");
      return;
    }

    setLoading(true);

    await addDoc(collection(db,"orders"),{
      userId:user.uid,
      items,
      total,
      customer,
      paymentMethod:"cod",
      paymentStatus:"pending",
      status:"placed",
      createdAt:serverTimestamp()
    });

    await sendWhatsApp();

    alert("Order placed ✅");

    localStorage.removeItem("buy-now");

    setLoading(false);
  };

  return(

    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 text-white">

      <div className="max-w-xl mx-auto">

        <h1 className="text-3xl font-bold text-center mb-6">
          Checkout 🛍️
        </h1>

        {/* GLASS SUMMARY */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 mb-4 shadow-lg">

          {items.map(item=>(
            <div key={item.id} className="flex justify-between text-sm mb-2">
              <span>{item.name} × {item.quantity}</span>
              <span>₹{item.price}</span>
            </div>
          ))}

          <div className="flex justify-between font-bold mt-3 text-green-400">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

        </div>

        {/* GLASS FORM */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5 space-y-3 shadow-lg">

          {[
            ["First Name","firstName"],
            ["Last Name","lastName"],
            ["City","city"],
            ["State","state"],
            ["Pin Code","zip"],
            ["Phone","phone"],
            ["Email","email"]
          ].map(([label,key])=>(
            <input
              key={key}
              placeholder={label}
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={(e)=>setCustomer({...customer,[key]:e.target.value})}
            />
          ))}

          <textarea
            placeholder="Address"
            className="w-full p-3 rounded-xl bg-white/10 border border-white/20"
            onChange={(e)=>setCustomer({...customer,address:e.target.value})}
          />

          {/* PAY */}
          <button
            onClick={placeOrder}
            className="w-full py-3 rounded-xl font-semibold text-lg bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg hover:scale-105 transition"
          >
            {loading ? "Processing..." : `Pay ₹${total}`}
          </button>

          {/* COD */}
          <button
            onClick={placeCOD}
            disabled={!codUnlocked}
            className={`w-full py-3 rounded-xl font-semibold text-lg ${
              codUnlocked
                ? "bg-white text-black hover:scale-105"
                : "bg-gray-500"
            }`}
          >
            {codUnlocked ? "Cash on Delivery" : "COD Locked"}
          </button>

        </div>

      </div>

    </div>
  );
}

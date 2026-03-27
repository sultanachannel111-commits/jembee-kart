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

  /* ========================
  LOAD CART + USER + ADDRESS
  ======================== */

  useEffect(()=>{

    const unsub = onAuthStateChanged(auth, async (u)=>{
      if(!u) return;

      setUser(u);

      // ✅ AUTO LOAD ADDRESS
      const userDoc = await getDoc(doc(db,"users",u.uid));
      if(userDoc.exists()){
        const data = userDoc.data();
        if(data.address){
          setCustomer(data.address);
        }
      }

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

      // COD unlock check
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

  /* ========================
  SAVE ADDRESS
  ======================== */

  const saveAddress = async ()=>{
    if(!user) return;

    await setDoc(
      doc(db,"users",user.uid),
      { address: customer },
      { merge:true }
    );
  };

  /* ========================
  TOTAL
  ======================== */

  const total = items.reduce(
    (sum,i)=> sum + (Number(i.price) * (i.quantity || 1)),
    0
  );

  /* ========================
  ONLINE PAYMENT
  ======================== */

  const placeOrder = async()=>{

    if(!customer.firstName || !customer.phone){
      alert("Please fill details");
      return;
    }

    await saveAddress(); // ✅ SAVE

    if(total <= 0){
      alert("Invalid amount ❌");
      return;
    }

    setLoading(true);

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

    localStorage.removeItem("buy-now");

    setLoading(false);
  };

  /* ========================
  COD ORDER
  ======================== */

  const placeCOD = async()=>{

    if(!codUnlocked){
      alert("COD locked ❌ Complete 2 prepaid orders first");
      return;
    }

    if(!customer.firstName || !customer.phone){
      alert("Please fill details");
      return;
    }

    await saveAddress(); // ✅ SAVE

    if(items.length === 0){
      alert("Cart empty ❌");
      return;
    }

    setLoading(true);

    await addDoc(collection(db,"orders"),{

      userId: user.uid,
      items,
      total,
      customer,

      paymentMethod:"cod",
      paymentStatus:"pending",
      status:"placed",

      createdAt:serverTimestamp()
    });

    alert("Order placed (COD) ✅");

    localStorage.removeItem("buy-now");

    setLoading(false);
  };

  /* ========================
  UI
  ======================== */

  return(

    <div className="min-h-screen bg-gray-100 p-4">

      <div className="max-w-xl mx-auto">

        <h1 className="text-2xl font-bold mb-4 text-center">
          Checkout
        </h1>

        {/* ORDER SUMMARY */}
        <div className="bg-white p-4 rounded-xl mb-4">

          {items.map(item=>(
            <div key={item.id} className="flex justify-between text-sm mb-2">
              <span>{item.name} × {item.quantity}</span>
              <span>₹{item.price}</span>
            </div>
          ))}

          <div className="border-t mt-3 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-green-600">₹{total}</span>
          </div>

        </div>

        {/* FORM */}
        <div className="bg-white p-4 rounded-xl space-y-3">

          <input
            placeholder="First Name"
            value={customer.firstName}
            onChange={(e)=>setCustomer({...customer,firstName:e.target.value})}
            className="w-full p-3 border rounded-lg"
          />

          <input
            placeholder="Last Name"
            value={customer.lastName}
            onChange={(e)=>setCustomer({...customer,lastName:e.target.value})}
            className="w-full p-3 border rounded-lg"
          />

          <textarea
            placeholder="Address"
            value={customer.address}
            onChange={(e)=>setCustomer({...customer,address:e.target.value})}
            className="w-full p-3 border rounded-lg"
          />

          <input
            placeholder="City"
            value={customer.city}
            onChange={(e)=>setCustomer({...customer,city:e.target.value})}
            className="w-full p-3 border rounded-lg"
          />

          <input
            placeholder="State"
            value={customer.state}
            onChange={(e)=>setCustomer({...customer,state:e.target.value})}
            className="w-full p-3 border rounded-lg"
          />

          <input
            placeholder="Pin Code"
            value={customer.zip}
            onChange={(e)=>setCustomer({...customer,zip:e.target.value})}
            className="w-full p-3 border rounded-lg"
          />

          <input
            placeholder="Phone"
            value={customer.phone}
            onChange={(e)=>setCustomer({...customer,phone:e.target.value})}
            className="w-full p-3 border rounded-lg"
          />

          <input
            placeholder="Email"
            value={customer.email}
            onChange={(e)=>setCustomer({...customer,email:e.target.value})}
            className="w-full p-3 border rounded-lg"
          />

          {/* PAY */}
          <button
            onClick={placeOrder}
            className="w-full bg-green-600 text-white p-3 rounded-lg"
          >
            {loading ? "Processing..." : `Pay ₹${total}`}
          </button>

          {/* COD */}
          <button
            onClick={placeCOD}
            disabled={!codUnlocked}
            className={`w-full p-3 rounded-lg text-white ${
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

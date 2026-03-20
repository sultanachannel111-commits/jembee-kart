"use client";

import { useEffect, useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import { auth, db } from "@/lib/firebase";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

export default function CheckoutPage(){

  const [items,setItems] = useState<any[]>([]);
  const [user,setUser] = useState<any>(null);
  const [loading,setLoading] = useState(false);
  const [prepaidCount,setPrepaidCount] = useState(0);

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

  /* ================= LOAD ================= */
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth,async(u)=>{
      if(!u) return;

      setUser(u);

      // CART
      const snap = await getDocs(
        collection(db,"carts",u.uid,"items")
      );

      const data:any[] = [];
      snap.forEach(doc=>{
        data.push({ id:doc.id, ...doc.data() });
      });

      setItems(data);

      // PREPAID COUNT
      const orderSnap = await getDocs(collection(db,"orders"));

      let count = 0;

      orderSnap.forEach(doc=>{
        const d:any = doc.data();

        if(
          d.userId === u.uid &&
          d.paymentMethod === "online" &&
          d.paymentStatus === "paid"
        ){
          count++;
        }
      });

      setPrepaidCount(count);

    });

    return ()=>unsub();
  },[]);

  /* ================= TOTAL ================= */
  const total = items.reduce(
    (sum,i)=> sum + (i.price * (i.quantity || 1)),
    0
  );

  /* ================= VALIDATION ================= */
  const validate = ()=>{

    if(!customer.firstName) return alert("⚠️ Enter First Name");
    if(!customer.address) return alert("⚠️ Enter Address");
    if(!customer.phone || customer.phone.length !== 10)
      return alert("⚠️ Enter valid Phone Number");

    return true;
  };

  /* ================= PAYMENT ================= */
  const placeOrder = async()=>{

    if(!validate()) return;

    if(items.length === 0){
      alert("Cart empty");
      return;
    }

    try{

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
        alert("❌ Payment failed");
        setLoading(false);
        return;
      }

      const cashfree = await load({
        mode:"sandbox"
      });

      await cashfree.checkout({
        paymentSessionId:data.payment_session_id,
        redirectTarget:"_self"
      });

    }catch(err){
      console.log(err);
      alert("❌ Server error");
    }

    setLoading(false);
  };

  /* ================= COD ================= */
  const handleCOD = async()=>{

    if(prepaidCount < 2){
      alert("⚠️ Complete 2 prepaid orders first");
      return;
    }

    await addDoc(collection(db,"orders"),{
      userId:user.uid,
      items,
      total,
      customer,

      paymentMethod:"cod",
      paymentStatus:"pending",
      status:"pending",

      createdAt:serverTimestamp()
    });

    alert("✅ COD Order Placed");
  };

  /* ================= UI ================= */

  return(

    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">

      <div className="max-w-xl mx-auto">

        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-4 text-center">
          Checkout
        </h1>

        {/* TOTAL CARD */}
        <div className="bg-white rounded-2xl shadow p-4 mb-4 flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-lg">₹{total}</span>
        </div>

        {/* FORM */}
        <div className="bg-white rounded-2xl shadow p-5 space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="First Name"
              className="p-3 rounded-xl border bg-gray-100"
              value={customer.firstName}
              onChange={(e)=>setCustomer({...customer,firstName:e.target.value})}
            />

            <input
              placeholder="Last Name"
              className="p-3 rounded-xl border bg-gray-100"
              value={customer.lastName}
              onChange={(e)=>setCustomer({...customer,lastName:e.target.value})}
            />
          </div>

          <textarea
            placeholder="Full Address"
            className="p-3 rounded-xl border bg-gray-100 w-full"
            value={customer.address}
            onChange={(e)=>setCustomer({...customer,address:e.target.value})}
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="City"
              className="p-3 rounded-xl border bg-gray-100"
              value={customer.city}
              onChange={(e)=>setCustomer({...customer,city:e.target.value})}
            />

            <input
              placeholder="State"
              className="p-3 rounded-xl border bg-gray-100"
              value={customer.state}
              onChange={(e)=>setCustomer({...customer,state:e.target.value})}
            />
          </div>

          <input
            placeholder="Pin Code"
            className="p-3 rounded-xl border bg-gray-100 w-full"
            value={customer.zip}
            onChange={(e)=>setCustomer({...customer,zip:e.target.value})}
          />

          <input
            placeholder="Phone Number"
            className="p-3 rounded-xl border bg-gray-100 w-full"
            value={customer.phone}
            onChange={(e)=>setCustomer({...customer,phone:e.target.value})}
          />

          <input
            placeholder="Email Address"
            className="p-3 rounded-xl border bg-gray-100 w-full"
            value={customer.email}
            onChange={(e)=>setCustomer({...customer,email:e.target.value})}
          />

          {/* PAY BUTTON */}
          <button
            onClick={placeOrder}
            className="w-full py-3 rounded-xl text-white font-semibold text-lg bg-gradient-to-r from-green-500 to-green-600 shadow"
          >
            {loading ? "Processing..." : `Pay ₹${total}`}
          </button>

          {/* COD BUTTON */}
          <button
            onClick={handleCOD}
            disabled={prepaidCount < 2}
            className={`w-full py-3 rounded-xl font-semibold ${
              prepaidCount < 2
                ? "bg-gray-300 text-gray-600"
                : "border border-black"
            }`}
          >
            {prepaidCount < 2
              ? `COD Locked (${prepaidCount}/2)`
              : "Cash on Delivery"}
          </button>

        </div>

      </div>

    </div>

  );
}

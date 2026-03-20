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

  /* LOAD CART */
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth,async(u)=>{
      if(!u) return;

      setUser(u);

      const snap = await getDocs(
        collection(db,"carts",u.uid,"items")
      );

      const data:any[] = [];
      snap.forEach(doc=>{
        data.push({ id:doc.id, ...doc.data() });
      });

      setItems(data);

    });

    return ()=>unsub();
  },[]);

  /* TOTAL */
  const total = items.reduce(
    (sum,i)=> sum + (Number(i.price) * (i.quantity || 1)),
    0
  );

  /* VALIDATION */
  const validate = ()=>{

    if(!customer.firstName){
      alert("Enter First Name");
      return false;
    }

    if(!customer.address){
      alert("Enter Address");
      return false;
    }

    if(!customer.phone || customer.phone.length !== 10){
      alert("Enter valid phone");
      return false;
    }

    if(!customer.email){
      alert("Enter email");
      return false;
    }

    return true;
  };

  /* PAYMENT */
  const placeOrder = async()=>{

    if(!validate()) return;

    if(items.length === 0){
      alert("Cart empty");
      return;
    }

    try{

      setLoading(true);

      // 🔥 CREATE ORDER
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

      // 🔥 CALL API
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

      console.log("PAYMENT RESPONSE:", data);

      // ❌ ERROR HANDLE
      if(!data.payment_session_id){
        alert("Payment init failed ❌");
        setLoading(false);
        return;
      }

      // 🔥 CASHFREE LOAD
      const cashfree = await load({
        mode:"production" // 👉 sandbox use कर रहे हो तो "sandbox"
      });

      await cashfree.checkout({
        paymentSessionId:data.payment_session_id,
        redirectTarget:"_self"
      });

    }catch(err){
      console.log(err);
      alert("Server error ❌");
    }

    setLoading(false);
  };

  return(

    <div className="p-6 max-w-xl mx-auto">

      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <div className="mb-4 font-bold text-lg">
        Total ₹{total}
      </div>

      {/* FORM */}
      <input
        placeholder="First Name"
        className="border p-3 w-full mb-2 rounded"
        onChange={(e)=>setCustomer({...customer,firstName:e.target.value})}
      />

      <textarea
        placeholder="Address"
        className="border p-3 w-full mb-2 rounded"
        onChange={(e)=>setCustomer({...customer,address:e.target.value})}
      />

      <input
        placeholder="Phone (10 digit)"
        className="border p-3 w-full mb-2 rounded"
        onChange={(e)=>setCustomer({...customer,phone:e.target.value})}
      />

      <input
        placeholder="Email"
        className="border p-3 w-full mb-4 rounded"
        onChange={(e)=>setCustomer({...customer,email:e.target.value})}
      />

      {/* BUTTON */}
      <button
        onClick={placeOrder}
        className="bg-green-600 text-white w-full py-3 rounded-lg text-lg"
      >
        {loading ? "Processing..." : `Pay ₹${total}`}
      </button>

    </div>

  );
}

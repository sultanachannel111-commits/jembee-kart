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
    (sum,i)=> sum + (i.price * (i.quantity || 1)),
    0
  );

  /* VALIDATION */
  const validate = ()=>{
    if(!customer.firstName) return alert("Enter First Name");
    if(!customer.address) return alert("Enter Address");
    if(!customer.phone) return alert("Enter Phone");
    return true;
  };

  /* PAYMENT */
  const placeOrder = async()=>{

    if(!validate()) return;

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

      console.log("PAYMENT RESPONSE:", data);

      if(!data.payment_session_id){
        alert("Payment failed");
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
      alert("Error");
    }

    setLoading(false);
  };

  return(

    <div className="p-6 max-w-xl mx-auto">

      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <div className="mb-4 font-bold">Total ₹{total}</div>

      {/* FORM */}
      <input placeholder="First Name" className="border p-2 w-full mb-2"
        onChange={(e)=>setCustomer({...customer,firstName:e.target.value})}/>

      <textarea placeholder="Address" className="border p-2 w-full mb-2"
        onChange={(e)=>setCustomer({...customer,address:e.target.value})}/>

      <input placeholder="Phone" className="border p-2 w-full mb-2"
        onChange={(e)=>setCustomer({...customer,phone:e.target.value})}/>

      <button
        onClick={placeOrder}
        className="bg-green-600 text-white w-full py-3 rounded"
      >
        {loading ? "Processing..." : `Pay ₹${total}`}
      </button>

    </div>
  );
}

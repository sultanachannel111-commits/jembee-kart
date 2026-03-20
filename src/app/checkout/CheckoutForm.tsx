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

  /* ================= LOAD DATA ================= */
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth,async(u)=>{
      if(!u) return;

      setUser(u);

      // 🛒 CART LOAD
      const snap = await getDocs(
        collection(db,"carts",u.uid,"items")
      );

      const data:any[] = [];
      snap.forEach(doc=>{
        data.push({ id:doc.id, ...doc.data() });
      });

      setItems(data);

      // 💳 PREPAID COUNT
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

    if(!customer.firstName) return alert("Enter First Name");
    if(!customer.address) return alert("Enter Address");
    if(!customer.phone || customer.phone.length !== 10)
      return alert("Enter valid phone");

    return true;
  };

  /* ================= ONLINE PAYMENT ================= */
  const placeOrder = async()=>{

    if(!validate()) return;

    if(items.length === 0){
      alert("Cart empty");
      return;
    }

    try{

      setLoading(true);

      // 📝 ORDER CREATE
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

      // 💳 CALL API
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
        alert("❌ Payment failed. Try again.");
        setLoading(false);
        return;
      }

      // 🔥 SANDBOX MODE USE
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

    <div className="p-6 max-w-xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        Checkout
      </h1>

      <div className="mb-4 text-lg font-bold">
        Total : ₹{total}
      </div>

      {/* PAY BUTTON */}
      <button
        onClick={placeOrder}
        className="bg-green-600 text-white px-6 py-3 rounded w-full mb-3"
      >
        {loading ? "Processing..." : `Pay ₹${total}`}
      </button>

      {/* COD */}
      <button
        onClick={handleCOD}
        disabled={prepaidCount < 2}
        className={`w-full py-3 rounded ${
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
  );
}

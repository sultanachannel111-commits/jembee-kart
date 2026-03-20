"use client";

import { useEffect, useState } from "react";
import { getTheme } from "@/services/themeService";
import { load } from "@cashfreepayments/cashfree-js";
import { auth, db } from "@/lib/firebase";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

export default function CheckoutPage(){

  const [items,setItems] = useState<any[]>([]);
  const [user,setUser] = useState<any>(null);
  const [loading,setLoading] = useState(false);
  const [prepaidCount,setPrepaidCount] = useState(0);

  const [theme, setTheme] = useState<any>({
    button: "#4f46e5"
  });

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

  /* LOAD USER + CART */
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth,async(u)=>{
      if(!u) return;
      setUser(u);

      const snap = await getDocs(
        collection(db,"carts",u.uid,"items")
      );

      const cartData:any[] = [];
      snap.forEach(doc=>{
        cartData.push({ id:doc.id, ...doc.data() });
      });

      setItems(cartData);

      // prepaid count
      const orderSnap = await getDocs(collection(db,"orders"));
      let count = 0;

      orderSnap.forEach(doc=>{
        const d:any = doc.data();
        if(d.userId === u.uid && d.paymentMethod === "online"){
          count++;
        }
      });

      setPrepaidCount(count);

    });

    return ()=>unsub();
  },[]);

  /* THEME */
  useEffect(()=>{
    async function loadThemeData(){
      const t = await getTheme();
      if(t) setTheme(t);
    }
    loadThemeData();
  },[]);

  /* TOTAL */
  const total = items.reduce(
    (sum,i)=> sum + (Number(i.price || 0) * Number(i.quantity || 1)),
    0
  );

  /* VALIDATION */
  const validateCustomer = ()=>{
    if(!customer.firstName) return alert("Enter First Name");
    if(!customer.address) return alert("Enter Address");
    if(!customer.city) return alert("Enter City");
    if(!customer.state) return alert("Enter State");
    if(!customer.zip) return alert("Enter Pincode");
    if(!customer.phone || customer.phone.length !== 10)
      return alert("Enter valid phone");
    if(!customer.email) return alert("Enter Email");
    return true;
  };

  /* ONLINE PAYMENT */
  const placeOrder = async()=>{
    if(!validateCustomer()) return;
    if(items.length === 0) return alert("Cart empty");

    setLoading(true);

    const orderRef = await addDoc(collection(db,"orders"),{
      userId:user.uid,
      items,
      total,
      customer,
      paymentMethod:"online",
      status:"pending",
      createdAt:serverTimestamp()
    });

    const res = await fetch("/api/cashfree/create-order",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        orderId:orderRef.id,
        amount:total
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

  /* COD */
  const handleCOD = async()=>{
    if(prepaidCount < 2){
      alert("Complete 2 prepaid orders to unlock COD");
      return;
    }

    if(!validateCustomer()) return;

    await addDoc(collection(db,"orders"),{
      userId:user.uid,
      items,
      total,
      customer,
      paymentMethod:"cod",
      status:"pending",
      createdAt:serverTimestamp()
    });

    for(const item of items){
      await deleteDoc(doc(db,"carts",user.uid,"items",item.id));
    }

    alert("COD Order placed");
  };

  return(

    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">

      <div className="max-w-xl mx-auto">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Checkout
        </h1>

        {/* CART CARD */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 space-y-4">

          {items.map(item=>(
            <div key={item.id} className="flex gap-4">

              <img
                src={item.image}
                className="w-20 h-20 rounded-xl object-cover"
              />

              <div className="flex-1">

                <p className="font-semibold">
                  {item.name}
                </p>

                <p className="text-indigo-600 font-bold">
                  ₹{item.price}
                </p>

                <p className="text-sm text-gray-500">
                  Qty: {item.quantity}
                </p>

              </div>

            </div>
          ))}

        </div>

        {/* TOTAL */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₹{total}</span>
        </div>

        {/* FORM CARD */}
        <div className="bg-white rounded-2xl shadow-lg p-5 space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <input placeholder="First Name"
              className="input-premium"
              onChange={(e)=>setCustomer({...customer,firstName:e.target.value})}
            />
            <input placeholder="Last Name"
              className="input-premium"
              onChange={(e)=>setCustomer({...customer,lastName:e.target.value})}
            />
          </div>

          <textarea placeholder="Full Address"
            className="input-premium"
            onChange={(e)=>setCustomer({...customer,address:e.target.value})}
          />

          <div className="grid grid-cols-2 gap-3">
            <input placeholder="City"
              className="input-premium"
              onChange={(e)=>setCustomer({...customer,city:e.target.value})}
            />
            <input placeholder="State"
              className="input-premium"
              onChange={(e)=>setCustomer({...customer,state:e.target.value})}
            />
          </div>

          <input placeholder="Pin Code"
            className="input-premium"
            onChange={(e)=>setCustomer({...customer,zip:e.target.value})}
          />

          <input placeholder="Phone"
            className="input-premium"
            onChange={(e)=>setCustomer({...customer,phone:e.target.value})}
          />

          <input placeholder="Email"
            className="input-premium"
            onChange={(e)=>setCustomer({...customer,email:e.target.value})}
          />

          {/* BUTTONS */}

          <button
            onClick={placeOrder}
            className="w-full py-3 rounded-xl text-white font-semibold shadow-md transition hover:scale-[1.02]"
            style={{ background: theme.button }}
          >
            {loading ? "Processing..." : `Pay ₹${total}`}
          </button>

          <button
            onClick={handleCOD}
            className="w-full py-3 rounded-xl border font-semibold hover:bg-gray-50"
          >
            {prepaidCount < 2
              ? `COD Locked (${prepaidCount}/2)`
              : "Cash on Delivery"}
          </button>

        </div>

      </div>

      {/* INPUT STYLE */}
      <style jsx>{`
        .input-premium{
          width:100%;
          padding:12px;
          border-radius:12px;
          border:1px solid #e5e7eb;
          outline:none;
          transition:0.2s;
        }

        .input-premium:focus{
          border-color:#6366f1;
          box-shadow:0 0 0 2px rgba(99,102,241,0.2);
        }
      `}</style>

    </div>

  );
}

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
    button: "#16a34a"
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

  /* =====================
  LOAD USER + CART
  ===================== */

  useEffect(()=>{

    const unsub = onAuthStateChanged(auth,async(u)=>{

      if(!u) return;

      setUser(u);

      try{

        // 🛒 CART
        const snap = await getDocs(
          collection(db,"carts",u.uid,"items")
        );

        const cartData:any[] = [];

        snap.forEach(doc=>{
          cartData.push({
            id:doc.id,
            ...doc.data()
          });
        });

        setItems(cartData);

        // 💳 PREPAID COUNT
        const orderSnap = await getDocs(collection(db,"orders"));

        let count = 0;

        orderSnap.forEach(doc=>{
          const d:any = doc.data();

          if(
            d.userId === u.uid &&
            d.paymentMethod === "online"
          ){
            count++;
          }
        });

        setPrepaidCount(count);

      }catch(err){
        console.log(err);
      }

    });

    return ()=>unsub();

  },[]);

  /* =====================
  THEME
  ===================== */

  useEffect(()=>{
    async function loadThemeData(){
      const t = await getTheme();
      if(t) setTheme(t);
    }
    loadThemeData();
  },[]);

  /* =====================
  TOTAL
  ===================== */

  const total = items.reduce(
    (sum,i)=> sum + (Number(i.price || 0) * Number(i.quantity || 1)),
    0
  );

  /* =====================
  VALIDATION
  ===================== */

  const validateCustomer = ()=>{

    if(!customer.firstName) return alert("Enter First Name");
    if(!customer.address) return alert("Enter Address");
    if(!customer.city) return alert("Enter City");
    if(!customer.state) return alert("Enter State");
    if(!customer.zip) return alert("Enter Pincode");

    if(!customer.phone || customer.phone.length !== 10){
      return alert("Enter valid phone number");
    }

    if(!customer.email) return alert("Enter Email");

    return true;
  };

  /* =====================
  ONLINE PAYMENT
  ===================== */

  const placeOrder = async()=>{

    if(!validateCustomer()) return;

    if(items.length === 0){
      alert("Cart empty");
      return;
    }

    setLoading(true);

    try{

      const orderRef = await addDoc(
        collection(db,"orders"),
        {
          userId:user.uid,
          items,
          total,
          customer,
          paymentMethod:"online",
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
          items,
          customer
        })
      });

      const data = await res.json();

      if(!data.payment_session_id){
        setLoading(false);
        alert("Payment failed");
        return;
      }

      const cashfree = await load({ mode:"production" });

      await cashfree.checkout({
        paymentSessionId:data.payment_session_id,
        redirectTarget:"_self"
      });

      setLoading(false);

    }catch(err){
      console.log(err);
      setLoading(false);
      alert("Server error");
    }

  };

  /* =====================
  COD FUNCTION
  ===================== */

  const handleCOD = async()=>{

    if(prepaidCount < 2){
      alert("⚠️ First complete 2 prepaid orders to unlock COD");
      return;
    }

    if(!validateCustomer()) return;

    if(items.length === 0){
      alert("Cart empty");
      return;
    }

    await addDoc(
      collection(db,"orders"),
      {
        userId:user.uid,
        items,
        total,
        customer,
        paymentMethod:"cod",
        status:"pending",
        createdAt:serverTimestamp()
      }
    );

    // 🧹 CLEAR CART
    for(const item of items){
      await deleteDoc(
        doc(db,"carts",user.uid,"items",item.id)
      );
    }

    alert("✅ COD Order Placed");

  };

  /* =====================
  UI
  ===================== */

  return(

    <div className="p-6 max-w-xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        Checkout
      </h1>

      {/* PRODUCTS */}

      <div className="space-y-4 mb-6">

        {items.map(item=>(

          <div
            key={item.id}
            className="bg-white p-4 rounded-xl shadow flex gap-4"
          >

            <img
              src={item.image}
              className="w-20 h-20 object-cover rounded"
            />

            <div className="flex-1">

              <p className="font-semibold">
                {item.name}
              </p>

              <p className="text-green-600 font-bold">
                ₹{item.price}
              </p>

              <p className="text-sm text-gray-500">
                Qty : {item.quantity}
              </p>

            </div>

          </div>

        ))}

      </div>

      {/* TOTAL */}

      <div className="text-xl font-bold mb-6">
        Total : ₹{total}
      </div>

      {/* CUSTOMER FORM */}

      <div className="space-y-4">

        <input placeholder="First Name" className="input"
          value={customer.firstName}
          onChange={(e)=>setCustomer({...customer,firstName:e.target.value})}
        />

        <input placeholder="Last Name" className="input"
          value={customer.lastName}
          onChange={(e)=>setCustomer({...customer,lastName:e.target.value})}
        />

        <textarea placeholder="Full Address" className="input"
          value={customer.address}
          onChange={(e)=>setCustomer({...customer,address:e.target.value})}
        />

        <input placeholder="City" className="input"
          value={customer.city}
          onChange={(e)=>setCustomer({...customer,city:e.target.value})}
        />

        <input placeholder="State" className="input"
          value={customer.state}
          onChange={(e)=>setCustomer({...customer,state:e.target.value})}
        />

        <input placeholder="Pin Code" className="input"
          value={customer.zip}
          onChange={(e)=>setCustomer({...customer,zip:e.target.value})}
        />

        <input placeholder="Phone Number" className="input"
          value={customer.phone}
          onChange={(e)=>setCustomer({...customer,phone:e.target.value})}
        />

        <input placeholder="Email Address" className="input"
          value={customer.email}
          onChange={(e)=>setCustomer({...customer,email:e.target.value})}
        />

        {/* ONLINE PAYMENT */}

        <button
          onClick={placeOrder}
          style={{ background: theme.button }}
          className="text-white px-6 py-3 rounded w-full"
        >
          {loading ? "Processing..." : `Pay ₹${total}`}
        </button>

        {/* COD BUTTON */}

        <button
          onClick={handleCOD}
          className="w-full border border-black py-3 rounded"
        >
          {prepaidCount < 2
            ? `COD Locked (${prepaidCount}/2 prepaid done)`
            : "Cash on Delivery"
          }
        </button>

      </div>

    </div>

  );

}

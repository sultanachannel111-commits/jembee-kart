"use client";

import { useEffect, useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

/* 🔥 SAFE PRICE */
const getFinalPrice = (item:any) => {
  const base =
    Number(item?.variations?.[0]?.sizes?.[0]?.sellPrice ?? item?.price ?? 0);

  const discount = Number(item?.discount ?? 0);

  return Math.max(
    0,
    Math.round(
      discount > 0 ? base - (base * discount) / 100 : base
    )
  );
};

export default function CheckoutPage(){

  const router = useRouter();

  const [items,setItems] = useState<any[]>([]);
  const [debug,setDebug] = useState<any>({});
  const [user,setUser] = useState<any>(null);
  const [loading,setLoading] = useState(false);

  const [payment,setPayment] = useState("online");

  const [shippingConfig,setShippingConfig] = useState({
    prepaid: 0,
    cod: 0
  });

  const [customer,setCustomer] = useState({
    firstName:"",
    phone:"",
    address:""
  });

  const [coupon,setCoupon] = useState("");
  const [couponDiscount,setCouponDiscount] = useState(0);

  /* 🔥 LOAD */
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async (u)=>{
      if(!u) return;

      setUser(u);

      const snap = await getDocs(collection(db,"carts",u.uid,"items"));

      console.log("SNAP SIZE:", snap.size);

      const arr:any[] = [];

      snap.forEach(doc=>{
        const d = doc.data();

        arr.push({
          id: doc.id,
          name: d.name,
          price: Number(d.price || 0),
          discount: Number(d.discount || 0),
          variations: d.variations || [],
          quantity: Number(d.quantity || 1),
          image: d.image || ""
        });
      });

      console.log("CART DATA:", arr);

      setItems(arr);

      const shipDoc = await getDoc(doc(db,"config","shipping"));
      if(shipDoc.exists()){
        setShippingConfig(shipDoc.data());
      }

    });

    return ()=>unsub();
  },[]);

  /* 💰 TOTAL */
  const total = items.reduce((sum,i)=>{
    const final = getFinalPrice(i);

    console.log("ITEM:", i);
    console.log("FINAL:", final);

    return sum + final * (i.quantity || 1);
  },0);

  /* 💸 DISCOUNT */
  const onlineDiscount = payment === "online" ? 10 : 0;

  const finalPay = Math.max(0, total - couponDiscount - onlineDiscount);

  /* 🚚 SHIPPING */
  const shippingCharge =
    payment === "cod"
      ? Number(shippingConfig.cod || 0)
      : Number(shippingConfig.prepaid || 0);

  const grandTotal = finalPay + shippingCharge;

  /* 🔥 DEBUG UI */
  useEffect(()=>{
    setDebug({
      items,
      total,
      shipping: shippingCharge,
      final: grandTotal
    });
  },[items,total,shippingCharge,grandTotal]);

  /* 🎟️ COUPON */
  const applyCoupon = () => {
    if(coupon.toUpperCase() === "SAVE10"){
      setCouponDiscount(10);
    }else if(coupon.toUpperCase() === "FLAT50"){
      setCouponDiscount(50);
    }else{
      alert("Invalid coupon");
    }
  };

  return (

<div className="min-h-screen bg-gray-100 pb-40">

<div className="max-w-xl mx-auto">

{/* 🧾 DEBUG PANEL */}
<div className="bg-black text-green-400 p-3 text-xs mb-3">
<pre>{JSON.stringify(debug,null,2)}</pre>
</div>

{/* SUMMARY */}
<div className="bg-white p-4 rounded-xl shadow">

<h2 className="font-semibold mb-2">Order Summary</h2>

{items.map((i,index)=>{

  const price = getFinalPrice(i);

  return(
    <div key={index} className="flex justify-between border-b py-2">
      <span>{i.name} x{i.quantity}</span>
      <span>₹{price * i.quantity}</span>
    </div>
  );

})}

</div>

{/* TOTAL */}
<div className="bg-white mt-3 p-4 rounded-xl shadow">

<p>Items Total: ₹{total}</p>
<p>Shipping: ₹{shippingCharge}</p>
<p>Discount: ₹{couponDiscount + onlineDiscount}</p>

<p className="font-bold text-lg mt-2">
  Total: ₹{grandTotal}
</p>

</div>

</div>

</div>

  );
}

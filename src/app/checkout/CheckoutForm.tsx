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
      if(!u){
        console.log("❌ USER NOT LOGIN");
        return;
      }

      setUser(u);

      // 🔥 STEP 1: TRY USER CART PATH
      let arr:any[] = [];

      try{
        const snap = await getDocs(collection(db,"carts",u.uid,"items"));

        console.log("USER CART SIZE:", snap.size);

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

      }catch(err){
        console.log("❌ USER CART PATH FAIL");
      }

      // 🔥 STEP 2: अगर empty है तो fallback
      if(arr.length === 0){
        console.log("⚠️ FALLBACK RUNNING");

        const snap2 = await getDocs(collection(db,"carts"));

        snap2.forEach(doc=>{
          const d = doc.data();

          if(d.items){
            d.items.forEach((item:any)=>{
              arr.push({
                ...item,
                quantity: item.quantity || 1
              });
            });
          }
        });
      }

      console.log("🔥 FINAL CART:", arr);

      setItems(arr);

      // 🚚 SHIPPING LOAD
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

  /* 🛒 ORDER */
  const placeOrder = async()=>{

    if(!customer.firstName || !customer.phone){
      alert("Fill details");
      return;
    }

    setLoading(true);

    if(payment === "cod"){

      await addDoc(collection(db,"orders"),{
        userId: user.uid,
        items,
        total: grandTotal,
        paymentMethod:"cod",
        createdAt:serverTimestamp()
      });

      router.push("/order-success");

    }else{

      const res = await fetch("/api/cashfree/create-order",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          orderId:"order_"+Date.now(),
          amount: grandTotal,
          customer
        })
      });

      const data = await res.json();

      if (!data || !data.payment_session_id) {
        alert("Payment failed");
        setLoading(false);
        return;
      }

      const cashfree = await load({ mode:"production" });

      await cashfree.checkout({
        paymentSessionId:data.payment_session_id,
        redirectTarget:"_self"
      });
    }

    setLoading(false);
  };

  return (

<div className="min-h-screen bg-gray-100 pb-40">

<div className="max-w-xl mx-auto">

{/* 🧾 ORDER SUMMARY */}
<div className="bg-white p-4 mt-3 rounded-xl shadow">

<h2 className="font-semibold mb-2">Order Summary</h2>

{items.length === 0 && (
  <p className="text-red-500 text-sm">❌ Cart Empty (Firestore issue)</p>
)}

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

{/* 💰 TOTAL */}
<div className="bg-white mt-3 p-4 rounded-xl shadow">

<p>Items Total: ₹{total}</p>
<p>Shipping: ₹{shippingCharge}</p>
<p>Discount: ₹{couponDiscount + onlineDiscount}</p>

<p className="font-bold text-lg mt-2">
  Total: ₹{grandTotal}
</p>

</div>

{/* 📦 ADDRESS */}
<div className="bg-white mt-3 p-4 rounded-xl shadow space-y-2">
  <input placeholder="Name" className="w-full border p-2 rounded"
    value={customer.firstName}
    onChange={(e)=>setCustomer({...customer,firstName:e.target.value})}
  />
  <input placeholder="Phone" className="w-full border p-2 rounded"
    value={customer.phone}
    onChange={(e)=>setCustomer({...customer,phone:e.target.value})}
  />
  <textarea placeholder="Address" className="w-full border p-2 rounded"
    value={customer.address}
    onChange={(e)=>setCustomer({...customer,address:e.target.value})}
  />
</div>

{/* 🔘 ORDER BUTTON */}
<div className="p-4">
  <button
    onClick={placeOrder}
    className="w-full bg-purple-600 text-white py-3 rounded-xl"
  >
    {loading ? "Processing..." : "Place Order"}
  </button>
</div>

</div>
</div>

  );
}

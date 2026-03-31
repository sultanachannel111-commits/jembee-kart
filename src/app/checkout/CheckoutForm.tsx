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
  getDoc
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

/* 🔥 PRICE */
const getFinalPrice = (item:any) => {
  const price =
    item?.variations?.[0]?.sizes?.[0]?.sellPrice ??
    item.price ??
    0;

  const discount = item.discount || 0;

  return discount
    ? Math.round(price - (price * discount) / 100)
    : price;
};

export default function CheckoutPage(){

  const router = useRouter();

  const [items,setItems] = useState<any[]>([]);
  const [user,setUser] = useState<any>(null);
  const [loading,setLoading] = useState(false);

  const [payment,setPayment] = useState<"cod"|"online">("online");

  const [shipping,setShipping] = useState({
    prepaid:0,
    cod:0
  });

  const [customer,setCustomer] = useState({
    firstName:"",
    phone:"",
    address:""
  });

  /* 🔥 LOAD */
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async (u)=>{
      if(!u) return;

      setUser(u);

      const snap = await getDocs(collection(db,"carts",u.uid,"items"));
      const arr:any[] = [];

      snap.forEach(doc=>{
        const d = doc.data();
        arr.push({
          id: doc.id,
          price: d.price,
          discount: d.discount || 0,
          variations: d.variations || [],
          quantity: d.quantity || 1
        });
      });

      setItems(arr);

      const shipDoc = await getDoc(doc(db,"config","shipping"));
      if(shipDoc.exists()){
        const data:any = shipDoc.data();
        setShipping({
          prepaid:data.prepaid || 0,
          cod:data.cod || 0
        });
      }
    });

    return ()=>unsub();
  },[]);

  /* 💰 CALC */
  const total = items.reduce(
    (sum,i)=>sum + getFinalPrice(i)*(i.quantity||1),
    0
  );

  const onlineDiscount = payment==="online"?10:0;
  const shippingCharge = payment==="cod"?shipping.cod:shipping.prepaid;

  const grandTotal = Math.max(0, total - onlineDiscount + shippingCharge);

  /* 📦 DELIVERY */
  const getDeliveryDate = ()=>{
    const d = new Date();
    d.setDate(d.getDate()+5);
    return d.toDateString();
  };

  /* 🛒 ORDER */
  const placeOrder = async()=>{

    if(!user) return alert("Login required");
    if(!customer.firstName || !customer.phone)
      return alert("Fill details");

    setLoading(true);

    if(payment==="cod"){
      await addDoc(collection(db,"orders"),{
        userId:user.uid,
        items,
        total:grandTotal,
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
          amount:grandTotal,
          customer
        })
      });

      const data = await res.json();
      const cashfree = await load({ mode:"production" });

      if(!cashfree) return alert("Payment failed");

      await cashfree.checkout({
        paymentSessionId:data.payment_session_id,
        redirectTarget:"_self"
      });
    }

    setLoading(false);
  };

  return (
<div className="min-h-screen bg-gray-100 pb-32">

{/* 🔥 STEP BAR */}
<div className="bg-white p-3 shadow flex items-center gap-2 text-sm">
  <span className="bg-green-500 text-white px-2 rounded-full">✓</span>
  Review
  <div className="flex-1 h-[2px] bg-blue-500 mx-2"/>
  <span className="border px-2 rounded-full">2</span>
  Payment
</div>

<div className="max-w-xl mx-auto p-4 space-y-4">

{/* DELIVERY */}
<div className="bg-white p-4 rounded-xl shadow text-sm">
  🚚 Delivery by <b>{getDeliveryDate()}</b>
</div>

{/* PAYMENT */}
<div className="bg-white p-4 rounded-xl shadow space-y-3">

  <h2 className="font-semibold">Select payment method</h2>

  {/* COD */}
  <div
    onClick={()=>setPayment("cod")}
    className={`p-4 rounded-xl border flex justify-between ${
      payment==="cod"?"border-green-500 bg-green-50":""
    }`}
  >
    <div>
      <p className="font-medium">₹{grandTotal} Cash on Delivery 🚚</p>
      <p className="text-green-600 text-sm">
        {shipping.cod===0?"Free Delivery":`₹${shipping.cod}`}
      </p>
    </div>
    <div className={`w-5 h-5 rounded-full border ${
      payment==="cod"?"bg-green-500":""
    }`} />
  </div>

  {/* ONLINE */}
  <div
    onClick={()=>setPayment("online")}
    className={`p-4 rounded-xl border flex justify-between ${
      payment==="online"?"border-green-500 bg-green-50":""
    }`}
  >
    <div>
      <p className="font-medium">₹{grandTotal} Pay Online 💳</p>
      <p className="text-green-600 text-sm">
        ₹10 OFF + {shipping.prepaid===0?"Free":"₹"+shipping.prepaid}
      </p>
    </div>
    <div className={`w-5 h-5 rounded-full border ${
      payment==="online"?"bg-green-500":""
    }`} />
  </div>

</div>

{/* ADDRESS */}
<div className="bg-white p-4 rounded-xl shadow space-y-2">
  <input placeholder="Full Name" className="w-full border p-2 rounded"
    value={customer.firstName}
    onChange={(e)=>setCustomer({...customer,firstName:e.target.value})}/>
  <input placeholder="Phone" className="w-full border p-2 rounded"
    value={customer.phone}
    onChange={(e)=>setCustomer({...customer,phone:e.target.value})}/>
  <textarea placeholder="Address" className="w-full border p-2 rounded"
    value={customer.address}
    onChange={(e)=>setCustomer({...customer,address:e.target.value})}/>
</div>

{/* PRICE */}
<div className="bg-white p-4 rounded-xl shadow text-sm space-y-2">

  <div className="flex justify-between">
    <span>Product Price</span>
    <span>₹{total}</span>
  </div>

  <div className="flex justify-between text-green-600">
    <span>Online Discount</span>
    <span>-₹{onlineDiscount}</span>
  </div>

  <div className="flex justify-between">
    <span>Shipping</span>
    <span>{shippingCharge===0?"Free":"₹"+shippingCharge}</span>
  </div>

  <hr/>

  <div className="flex justify-between font-bold text-lg">
    <span>Total</span>
    <span>₹{grandTotal}</span>
  </div>

</div>

</div>

{/* 🔻 BOTTOM */}
<div className="fixed bottom-0 w-full bg-white p-4 flex justify-between items-center border-t">
  <p className="font-bold text-lg">₹{grandTotal}</p>

  <button
    onClick={placeOrder}
    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl"
  >
    {loading?"Processing...":"Place Order"}
  </button>
</div>

</div>
  );
}

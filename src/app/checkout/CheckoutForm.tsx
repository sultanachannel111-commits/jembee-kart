"use client";

import { useEffect, useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import { auth, db } from "@/lib/firebase";

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

export default function CheckoutPage(){

  const [items,setItems] = useState<any[]>([]);
  const [user,setUser] = useState<any>(null);
  const [payment,setPayment] = useState<"cod"|"online">("online");
  const [loading,setLoading] = useState(false);

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

      // address autofill
      const userDoc = await getDoc(doc(db,"users",u.uid));
      if(userDoc.exists()){
        const d = userDoc.data();
        if(d.address) setCustomer(d.address);
      }

      // cart load
      const cartSnap = await getDocs(collection(db,"carts",u.uid,"items"));
      const data:any[]=[];

      cartSnap.forEach(doc=>{
        data.push({...doc.data(), id:doc.id});
      });

      setItems(data);
    });

    return ()=>unsub();
  },[]);

  /* 💰 PRICE LOGIC (FIXED) */

  const originalTotal = items.reduce((sum,item)=>{
    const original =
      item?.variations?.[0]?.sizes?.[0]?.price || // 🔥 MRP
      item?.originalPrice ||
      item?.price || 0;

    return sum + original * (item.quantity||1);
  },0);

  const finalTotal = items.reduce((sum,item)=>{
    const final =
      item?.variations?.[0]?.sizes?.[0]?.sellPrice || // 🔥 SELL PRICE
      item?.sellPrice ||
      item?.price || 0;

    return sum + final * (item.quantity||1);
  },0);

  const discount = Math.max(0, originalTotal - finalTotal);

  const discountPercent =
    originalTotal > 0
      ? Math.round((discount / originalTotal) * 100)
      : 0;

  /* 🚚 SHIPPING */
  const shippingTotal = items.reduce(
    (sum,i)=> sum + ((i.shippingCharge||0)*(i.quantity||1)),
    0
  );

  const codTotal = finalTotal + shippingTotal;

  /* 💾 SAVE */
  const saveAddress = async ()=>{
    if(!user) return;
    await setDoc(doc(db,"users",user.uid),{address:customer},{merge:true});
  };

  /* 💳 ONLINE */
  const placeOnline = async()=>{
    if(!customer.firstName || !customer.phone){
      alert("Fill details");
      return;
    }

    await saveAddress();
    setLoading(true);

    const res = await fetch("/api/cashfree/create-order",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        orderId:"order_"+Date.now(),
        amount: finalTotal,
        customer
      })
    });

    const data = await res.json();

    const cashfree = await load({mode:"production"});
    await cashfree.checkout({
      paymentSessionId:data.payment_session_id,
      redirectTarget:"_self"
    });

    setLoading(false);
  };

  /* 🚚 COD */
  const placeCOD = async()=>{
    await addDoc(collection(db,"orders"),{
      userId:user.uid,
      items,
      total:codTotal,
      customer,
      paymentMethod:"cod",
      status:"placed",
      createdAt:serverTimestamp()
    });

    alert("Order placed ✅");
  };

  const handlePlace = ()=>{
    payment==="cod" ? placeCOD() : placeOnline();
  };

  return(
<div className="min-h-screen bg-gray-100 pb-24">

<div className="max-w-xl mx-auto p-4">

{/* 🔥 PAYMENT */}
<div className="bg-white rounded-xl p-4 space-y-3">

<h2 className="font-semibold text-lg">Select payment method</h2>

{/* COD */}
<div onClick={()=>setPayment("cod")}
className={`border p-3 rounded-lg cursor-pointer ${payment==="cod" && "border-green-500"}`}>

<div className="flex justify-between">
<span>₹{codTotal} Cash on Delivery 🚚</span>
<input type="radio" checked={payment==="cod"} readOnly />
</div>

<div className="text-xs mt-2 text-gray-600">
<span className="line-through">₹{originalTotal}</span>{" "}
<span className="text-green-600">{discountPercent}% OFF</span>{" "}
₹{discount}
</div>

<div className="text-green-600 text-xs">
{shippingTotal > 0 ? `Delivery ₹${shippingTotal}` : "Free Delivery"}
</div>

</div>

{/* ONLINE */}
<div onClick={()=>setPayment("online")}
className={`border p-3 rounded-lg cursor-pointer ${payment==="online" && "border-green-500"}`}>

<div className="flex justify-between">
<span>₹{finalTotal} Pay Online 💳</span>
<input type="radio" checked={payment==="online"} readOnly />
</div>

<div className="text-xs mt-2 text-gray-600">
<span className="line-through">₹{originalTotal}</span>{" "}
<span className="text-green-600">{discountPercent}% OFF</span>{" "}
₹{discount}
</div>

<div className="text-green-600 text-xs">
Free Delivery
</div>

</div>

</div>

{/* 🔥 ADDRESS */}
<div className="bg-white mt-4 p-4 rounded-xl space-y-2">

<h2 className="font-semibold">Delivery Details</h2>

<input placeholder="Name"
className="w-full p-2 border rounded"
value={customer.firstName}
onChange={(e)=>setCustomer({...customer,firstName:e.target.value})}
/>

<input placeholder="Phone"
className="w-full p-2 border rounded"
value={customer.phone}
onChange={(e)=>setCustomer({...customer,phone:e.target.value})}
/>

<textarea placeholder="Address"
className="w-full p-2 border rounded"
value={customer.address}
onChange={(e)=>setCustomer({...customer,address:e.target.value})}
/>

</div>

{/* 🔥 PRICE DETAILS */}
<div className="bg-white mt-4 p-4 rounded-xl">

<h2 className="font-semibold mb-2">Price Details</h2>

<div className="flex justify-between text-sm">
<span>Product Price</span>
<span className="line-through">₹{originalTotal}</span>
</div>

<div className="flex justify-between text-green-600 text-sm">
<span>Discount ({discountPercent}%)</span>
<span>-₹{discount}</span>
</div>

<div className="flex justify-between font-bold mt-2">
<span>Order Total</span>
<span>₹{payment==="cod" ? codTotal : finalTotal}</span>
</div>

</div>

</div>

{/* 🔥 BOTTOM */}
<div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-between">

<div>
<div className="font-bold text-lg">
₹{payment==="cod" ? codTotal : finalTotal}
</div>
<div className="text-xs text-purple-600">VIEW PRICE DETAILS</div>
</div>

<button onClick={handlePlace}
className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl">
{loading ? "Processing..." : "Place Order"}
</button>

</div>

</div>
  );
}

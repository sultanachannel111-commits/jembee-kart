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
import { getFinalPrice } from "@/utils/getFinalPrice";

export default function CheckoutPage(){

  const [items,setItems] = useState<any[]>([]);
  const [user,setUser] = useState<any>(null);
  const [loading,setLoading] = useState(false);

  const [offers,setOffers] = useState<any>({});
  const [payment,setPayment] = useState<"cod"|"online">("online");

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

  /* 🔥 LOAD DATA */
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

      // offers load
      const snap = await getDocs(collection(db,"offers"));
      const map:any = {};
      snap.forEach(doc=>{
        const d = doc.data();
        map[d.productId] = d.discount;
      });
      setOffers(map);

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

  /* 💰 TOTAL */
  const total = items.reduce(
    (sum,i)=> sum + (getFinalPrice(i,offers)*(i.quantity||1)),
    0
  );

  /* 💸 DISCOUNT */
  const discount = items.reduce((sum,item)=>{
    const original =
      item?.variations?.[0]?.sizes?.[0]?.price ||
      item?.price || 0;

    const final = getFinalPrice(item,offers);

    return sum + Math.max(0, original - final);
  },0);

  /* 🚚 SHIPPING (COD only) */
  const shippingTotal = items.reduce(
    (sum,i)=> sum + ((i.shippingCharge||0)*(i.quantity||1)),
    0
  );

  const codTotal = total + shippingTotal;

  /* 💾 SAVE ADDRESS */
  const saveAddress = async ()=>{
    if(!user) return;
    await setDoc(doc(db,"users",user.uid),{address:customer},{merge:true});
  };

  /* 💳 ONLINE PAYMENT */
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
        amount: total,
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

  /* 🚚 COD ORDER */
  const placeCOD = async()=>{
    if(!customer.firstName || !customer.phone){
      alert("Fill details");
      return;
    }

    await saveAddress();
    setLoading(true);

    await addDoc(collection(db,"orders"),{
      userId:user.uid,
      items,
      total:codTotal,
      customer,
      paymentMethod:"cod",
      paymentStatus:"pending",
      status:"placed",
      createdAt:serverTimestamp()
    });

    alert("Order placed ✅");
    setLoading(false);
  };

  const handlePlace = ()=>{
    if(payment==="cod") placeCOD();
    else placeOnline();
  };

  return(
<div className="min-h-screen bg-gray-100 pb-24">

<div className="max-w-xl mx-auto p-4">

{/* 🔥 OFFER BAR */}
{discount > 0 && (
<div className="bg-green-100 text-green-700 text-center py-2 rounded mb-3">
₹{discount} OFF on this order 🎉
</div>
)}

{/* 🔥 PAYMENT */}
<div className="bg-white rounded-xl p-4 space-y-3">

<h2 className="font-semibold text-lg">Select payment method</h2>

{/* COD */}
<div
onClick={()=>setPayment("cod")}
className={`border p-3 rounded-lg flex justify-between cursor-pointer ${
payment==="cod" && "border-green-500"
}`}
>
<span>₹{codTotal} Cash on Delivery 🚚</span>
<input type="radio" checked={payment==="cod"} readOnly />
</div>

{/* FRIEND */}
<div className="border p-3 rounded-lg">
₹{total} Ask Friends to Pay 🤝
</div>

{/* ONLINE */}
<div
onClick={()=>setPayment("online")}
className={`border p-3 rounded-lg flex justify-between cursor-pointer ${
payment==="online" && "border-green-500"
}`}
>
<div>
₹{total} Pay Online 💳
<div className="text-xs text-green-600">
Extra offers available
</div>
</div>
<input type="radio" checked={payment==="online"} readOnly />
</div>

</div>

{/* 🔥 ADDRESS */}
<div className="bg-white mt-4 p-4 rounded-xl space-y-2">

<h2 className="font-semibold text-lg">Delivery Details</h2>

<input
placeholder="Full Name"
className="w-full p-2 border rounded"
value={customer.firstName}
onChange={(e)=>setCustomer({...customer,firstName:e.target.value})}
/>

<input
placeholder="Phone Number"
className="w-full p-2 border rounded"
value={customer.phone}
onChange={(e)=>setCustomer({...customer,phone:e.target.value})}
/>

<textarea
placeholder="Full Address"
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
<span>₹{total + discount}</span>
</div>

{discount > 0 && (
<div className="flex justify-between text-green-600 text-sm">
<span>Total Discount</span>
<span>-₹{discount}</span>
</div>
)}

{payment==="cod" && shippingTotal > 0 && (
<div className="flex justify-between text-sm">
<span>Shipping</span>
<span>₹{shippingTotal}</span>
</div>
)}

<div className="flex justify-between font-bold mt-2 text-lg">
<span>Order Total</span>
<span>₹{payment==="cod" ? codTotal : total}</span>
</div>

</div>

</div>

{/* 🔥 BOTTOM BAR */}
<div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-between items-center">

<div>
<div className="font-bold text-lg">
₹{payment==="cod" ? codTotal : total}
</div>
<div className="text-xs text-purple-600">
VIEW PRICE DETAILS
</div>
</div>

<button
onClick={handlePlace}
className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold"
>
{loading ? "Processing..." : "Place Order"}
</button>

</div>

</div>
  );
}

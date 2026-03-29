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

  const [showPayment,setShowPayment] = useState(false);
  const [paymentMethod,setPaymentMethod] = useState("online");

  const [offers,setOffers] = useState<any>({});

  const [customer,setCustomer] = useState({
    firstName:"",
    phone:"",
    address:""
  });

  useEffect(()=>{

    const unsub = onAuthStateChanged(auth, async (u)=>{
      if(!u) return;

      setUser(u);

      const userDoc = await getDoc(doc(db,"users",u.uid));
      if(userDoc.exists()){
        const data = userDoc.data();
        if(data.address) setCustomer(data.address);
      }

      const offerSnap = await getDocs(collection(db,"offers"));
      const offerMap:any = {};
      offerSnap.forEach(doc=>{
        const d = doc.data();
        offerMap[d.productId] = d.discount;
      });
      setOffers(offerMap);

      const buyNow = localStorage.getItem("buy-now");

      if(buyNow){
        const parsed = JSON.parse(buyNow);
        setItems([{...parsed,quantity:1}]);
      }

    });

    return ()=>unsub();

  },[]);

  const total = items.reduce(
    (sum,i)=> sum + (getFinalPrice(i,offers)*(i.quantity||1)),0
  );

  // ✅ AUTO DISCOUNT (MEESHO STYLE)
  const discount = items.reduce((sum,item)=>{

    const original =
      item?.variations?.[0]?.sizes?.[0]?.price ||
      item?.price || 0;

    const final = getFinalPrice(item,offers);

    return sum + Math.max(0, original - final);

  },0);

  const shippingTotal = items.reduce(
    (sum,i)=> sum + ((i.shippingCharge||0)*(i.quantity||1)),0
  );

  const codTotal = total + shippingTotal;

  const placeOrder = async()=>{

    if(!customer.firstName || !customer.phone){
      alert("Fill details");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/cashfree/create-order",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        orderId:"order_"+Date.now(),
        amount:total,
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

  const placeCOD = async()=>{

    if(!customer.firstName || !customer.phone){
      alert("Fill details");
      return;
    }

    setLoading(true);

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
    setLoading(false);
  };

  return(

<div className="min-h-screen bg-gray-100 p-4">
<div className="max-w-xl mx-auto">

{/* STEP 1 */}
{!showPayment && (
<>
<h1 className="text-xl font-bold text-center mb-3">
REVIEW YOUR ORDER
</h1>

{/* OFF */}
{discount > 0 && (
<div className="bg-green-100 text-green-700 p-2 rounded mb-3 text-center">
₹{discount} OFF on this order 🎉
</div>
)}

{/* PRODUCT */}
<div className="bg-white p-4 rounded-xl mb-4">
{items.map(item=>(
<div key={item.id} className="flex justify-between">
<span>{item.name}</span>
<span>₹{getFinalPrice(item,offers)}</span>
</div>
))}
</div>

{/* TOTAL */}
<div className="bg-white p-4 rounded-xl mb-4">
<div className="flex justify-between">
<span>Price</span>
<span>₹{total}</span>
</div>

<div className="flex justify-between text-green-600">
<span>Discount</span>
<span>-₹{discount}</span>
</div>

<div className="flex justify-between font-bold">
<span>Total</span>
<span>₹{total}</span>
</div>
</div>

{/* ADDRESS */}
<div className="bg-white p-4 rounded-xl space-y-3">

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

<button
onClick={()=>setShowPayment(true)}
className="w-full py-3 bg-purple-600 text-white rounded"
>
Continue
</button>

</div>
</>
)}

{/* STEP 2 PAYMENT */}
{showPayment && (

<div className="bg-white p-4 rounded-xl">

<h2 className="font-semibold mb-2">Select payment method</h2>

{discount > 0 && (
<div className="bg-green-100 text-green-700 p-2 rounded mb-3 text-center">
₹{discount} OFF applied 🎉
</div>
)}

<div
onClick={()=>setPaymentMethod("cod")}
className={`p-3 border rounded mb-2 ${paymentMethod==="cod" && "border-green-500"}`}
>
₹{codTotal} Cash on Delivery
</div>

<div
onClick={()=>setPaymentMethod("online")}
className={`p-3 border rounded mb-2 ${paymentMethod==="online" && "border-green-500"}`}
>
₹{total} Pay Online
</div>

<button
onClick={paymentMethod==="cod" ? placeCOD : placeOrder}
className="w-full py-3 bg-purple-600 text-white rounded mt-3"
>
Place Order ₹{paymentMethod==="cod" ? codTotal : total}
</button>

<button
onClick={()=>setShowPayment(false)}
className="w-full mt-2 text-gray-500"
>
← Back
</button>

</div>

)}

</div>
</div>

  );
}

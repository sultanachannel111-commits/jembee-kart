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

  const [step,setStep] = useState(1); // 1=Review 2=Payment
  const [paymentMethod,setPaymentMethod] = useState("online");

  const [offers,setOffers] = useState<any>({});

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
      }else{
        const snap = await getDocs(collection(db,"carts",u.uid,"items"));
        const data:any[]=[];
        snap.forEach(doc=>{
          data.push({...doc.data(), id:doc.id});
        });
        setItems(data);
      }
    });

    return ()=>unsub();
  },[]);

  // 💰 TOTAL
  const total = items.reduce(
    (sum,i)=> sum + (getFinalPrice(i,offers)*(i.quantity||1)),0
  );

  // 💸 DISCOUNT (AUTO %)
  const discount = items.reduce((sum,item)=>{
    const original =
      item?.variations?.[0]?.sizes?.[0]?.price ||
      item?.price || 0;

    const final = getFinalPrice(item,offers);

    return sum + Math.max(0, original - final);
  },0);

  // 🚚 SHIPPING
  const shippingTotal = items.reduce(
    (sum,i)=> sum + ((i.shippingCharge||0)*(i.quantity||1)),0
  );

  const codTotal = total + shippingTotal;

  // 💾 SAVE ADDRESS
  const saveAddress = async ()=>{
    if(!user) return;
    await setDoc(doc(db,"users",user.uid),{address:customer},{merge:true});
  };

  // 💳 ONLINE PAYMENT
  const placeOrder = async()=>{
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

  // 🚚 COD
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
      status:"placed",
      createdAt:serverTimestamp()
    });

    alert("Order placed ✅");
    setLoading(false);
  };

  return(
<div className="min-h-screen bg-gray-100 p-4">
<div className="max-w-xl mx-auto">

{/* STEP HEADER */}
<div className="flex justify-center mb-4">
  <span className="text-sm">
    {step === 1 ? "Review" : "Payment"}
  </span>
</div>

{/* ================= STEP 1 ================= */}
{step === 1 && (
<>
<h1 className="text-xl font-bold mb-3">Review Your Order</h1>

{/* OFF */}
{discount > 0 && (
<div className="bg-green-100 text-green-700 p-2 rounded mb-3 text-center">
₹{discount} OFF on this order 🎉
</div>
)}

{/* PRODUCT */}
<div className="bg-white p-4 rounded-xl mb-3">
{items.map(item=>(
<div key={item.id} className="flex justify-between mb-2">
<span>{item.name} × {item.quantity}</span>
<span>₹{getFinalPrice(item,offers)}</span>
</div>
))}
</div>

{/* DELIVERY */}
<div className="bg-white p-4 rounded-xl mb-3 space-y-2">
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

{/* PRICE */}
<div className="bg-white p-4 rounded-xl mb-3">
<div className="flex justify-between">
<span>Product Price</span>
<span>₹{total}</span>
</div>

<div className="flex justify-between text-green-600">
<span>Total Discount</span>
<span>-₹{discount}</span>
</div>

<div className="flex justify-between font-bold mt-2">
<span>Order Total</span>
<span>₹{total}</span>
</div>
</div>

<button
onClick={()=>setStep(2)}
className="w-full py-3 bg-purple-600 text-white rounded-xl"
>
Continue
</button>
</>
)}

{/* ================= STEP 2 ================= */}
{step === 2 && (
<>
<h1 className="text-xl font-bold mb-3">Select payment method</h1>

{discount > 0 && (
<div className="bg-green-100 text-green-700 p-2 rounded mb-3 text-center">
₹{discount} OFF applied 🎉
</div>
)}

{/* COD */}
<div
onClick={()=>setPaymentMethod("cod")}
className={`p-3 rounded border mb-2 cursor-pointer ${
paymentMethod==="cod" && "border-green-500"
}`}
>
₹{codTotal} Cash on Delivery 🚚
</div>

{/* FRIEND */}
<div className="p-3 rounded border mb-2">
₹{total} Ask Friends to Pay 🤝
</div>

{/* ONLINE */}
<div
onClick={()=>setPaymentMethod("online")}
className={`p-3 rounded border mb-2 cursor-pointer ${
paymentMethod==="online" && "border-green-500"
}`}
>
₹{total} Pay Online 💳
</div>

<button
onClick={paymentMethod==="cod" ? placeCOD : placeOrder}
className="w-full py-3 bg-purple-600 text-white rounded-xl mt-3"
>
Place Order ₹{paymentMethod==="cod" ? codTotal : total}
</button>

<button
onClick={()=>setStep(1)}
className="w-full mt-2 text-gray-500"
>
← Back
</button>
</>
)}

</div>
</div>
  );
}

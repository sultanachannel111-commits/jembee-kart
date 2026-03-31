Checkout page 

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

/* 🔥 PRICE */
const getFinalPrice = (item:any) => {
  const sellPrice =
    item?.variations?.[0]?.sizes?.[0]?.sellPrice ||
    item.price ||
    0;

  const discount = item.discount || 0;

  return discount > 0
    ? Math.round(sellPrice - (sellPrice * discount) / 100)
    : sellPrice;
};

export default function CheckoutPage(){

  const router = useRouter();

  const [items,setItems] = useState<any[]>([]);
  const [user,setUser] = useState<any>(null);
  const [loading,setLoading] = useState(false);

  const [payment,setPayment] = useState("online");

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

      const userDoc = await getDoc(doc(db, "users", u.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.address) setCustomer(data.address);
      }

      const snap = await getDocs(collection(db,"carts",u.uid,"items"));
      const arr:any[] = [];

      snap.forEach(doc=>{
        const d = doc.data();
        arr.push({
          id: doc.id,
          name: d.name,
          price: d.price,
          discount: d.discount || 0,
          variations: d.variations || [],
          quantity: d.quantity || 1,
          image: d.image || ""
        });
      });

      setItems(arr);
    });

    return ()=>unsub();
  },[]);

  /* 💰 TOTAL */
  const total = items.reduce(
    (sum,i)=> sum + getFinalPrice(i)*(i.quantity||1),
    0
  );

  const finalPay = Math.max(0, total - couponDiscount);

  /* 🎟️ COUPON */
  const applyCoupon = () => {
    if(coupon === "SAVE10"){
      setCouponDiscount(10);
      alert("Coupon applied 🎉");
    }else if(coupon === "FLAT50"){
      setCouponDiscount(50);
      alert("₹50 OFF applied 🎉");
    }else{
      alert("Invalid coupon");
    }
  };

  /* 📦 DELIVERY */
  const getDeliveryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toDateString();
  };

  /* 💬 WHATSAPP */
  const sendWhatsApp = () => {
    const msg = `Order placed!\nAmount: ₹${finalPay}`;
    window.open(`https://wa.me/917061369212?text=${encodeURIComponent(msg)}`);
  };

  /* 💾 SAVE ADDRESS */
  const saveAddress = async ()=>{
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), {
      address: customer
    }, { merge: true });
  };

  /* 🛒 PLACE ORDER */
  const placeOrder = async()=>{

    if(!customer.firstName || !customer.phone){
      alert("Fill details");
      return;
    }

    await saveAddress();
    setLoading(true);

    if(payment === "cod"){

      await addDoc(collection(db,"orders"),{
        userId: user.uid,
        items,
        total: finalPay,
        paymentMethod:"cod",
        createdAt:serverTimestamp()
      });

      sendWhatsApp();
      router.push("/order-success");

    }else{

      const res = await fetch("/api/cashfree/create-order",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          orderId:"order_"+Date.now(),
          amount: finalPay,
          customer
        })
      });

      const data = await res.json();
      const cashfree = await load({ mode:"production" });

      await cashfree.checkout({
        paymentSessionId:data.payment_session_id,
        redirectTarget:"_self"
      });
    }

    setLoading(false);
  };

  return (

<div className="min-h-screen bg-gray-100 pb-32">

<div className="max-w-xl mx-auto">

{/* 🔥 HEADER */}
<div className="bg-white p-4 border-b">
  <h1 className="font-semibold">PAYMENT METHOD</h1>

  <div className="flex items-center mt-3 text-sm">
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center">✓</div>
      <span>Review</span>
    </div>

    <div className="flex-1 h-[2px] bg-blue-400 mx-2"></div>

    <div className="flex items-center gap-2">
      <div className="w-6 h-6 border rounded-full flex items-center justify-center">2</div>
      <span>Payment</span>
    </div>
  </div>
</div>

{/* 🎟️ COUPON */}
<div className="p-4">
  <div className="bg-white p-4 rounded-xl shadow">
    <p className="font-medium mb-2">Apply Coupon</p>

    <div className="flex gap-2">
      <input
        value={coupon}
        onChange={(e)=>setCoupon(e.target.value)}
        placeholder="Enter coupon"
        className="flex-1 border p-2 rounded"
      />

      <button
        onClick={applyCoupon}
        className="bg-black text-white px-4 rounded"
      >
        Apply
      </button>
    </div>
  </div>
</div>

{/* 📦 DELIVERY */}
<div className="px-4">
  <div className="bg-white p-4 rounded-xl shadow text-sm">
    🚚 Delivery by <b>{getDeliveryDate()}</b>
  </div>
</div>

<div className="p-4 space-y-4">

{/* 💳 PAYMENT OPTIONS */}

{/* COD */}
<div
onClick={()=>setPayment("cod")}
className={`p-4 rounded-xl bg-white border flex justify-between cursor-pointer ${payment==="cod" ? "border-pink-500" : ""}`}
>
  <div>
    <p className="font-medium">Cash on Delivery</p>
  </div>
  <div className={`w-5 h-5 rounded-full border ${payment==="cod" ? "bg-pink-500" : ""}`} />
</div>

{/* ONLINE */}
<div
onClick={()=>setPayment("online")}
className={`p-4 rounded-xl bg-white border cursor-pointer ${payment==="online" ? "border-pink-500" : ""}`}
>
  <div className="flex justify-between">
    <p className="font-medium">Pay Online</p>
    <div className={`w-5 h-5 rounded-full border ${payment==="online" ? "bg-pink-500" : ""}`} />
  </div>

  <p className="text-sm text-green-600 mt-2">
    Extra ₹10 OFF with UPI
  </p>
</div>

{/* ADDRESS */}
<div className="bg-white p-4 rounded-xl shadow space-y-2">
  <input
    placeholder="Full Name"
    className="w-full border p-2 rounded"
    value={customer.firstName}
    onChange={(e)=>setCustomer({...customer,firstName:e.target.value})}
  />

  <input
    placeholder="Phone"
    className="w-full border p-2 rounded"
    value={customer.phone}
    onChange={(e)=>setCustomer({...customer,phone:e.target.value})}
  />

  <textarea
    placeholder="Address"
    className="w-full border p-2 rounded"
    value={customer.address}
    onChange={(e)=>setCustomer({...customer,address:e.target.value})}
  />
</div>

</div>

{/* 🔥 BOTTOM BAR */}
<div className="fixed bottom-0 w-full bg-white border-t p-4 flex justify-between items-center">

  <div>
    <p className="font-bold text-lg">₹{finalPay}</p>
    {couponDiscount > 0 && (
      <p className="text-green-600 text-xs">
        Saved ₹{couponDiscount}
      </p>
    )}
  </div>

  <button
    onClick={placeOrder}
    className="bg-purple-600 text-white px-6 py-3 rounded-xl"
  >
    {loading ? "Processing..." : "Place Order"}
  </button>

</div>

</div>
</div>

  );
}

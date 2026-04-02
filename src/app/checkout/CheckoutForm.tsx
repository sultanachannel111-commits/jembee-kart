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
  const price =
    Number(item?.variations?.[0]?.sizes?.[0]?.sellPrice) ||
    Number(item?.price) ||
    0;

  const discount = Number(item?.discount) || 0;

  return discount > 0
    ? Math.round(price - (price * discount) / 100)
    : price;
};

export default function CheckoutPage(){

  const router = useRouter();

  const [items,setItems] = useState<any[]>([]);
  const [user,setUser] = useState<any>(null);
  const [loading,setLoading] = useState(false);

  const [payment,setPayment] = useState("online");

  const [shippingConfig,setShippingConfig] = useState({
    prepaid: 40,
    cod: 60
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

      // ✅ USER ADDRESS
      const userDoc = await getDoc(doc(db, "users", u.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.address) setCustomer(data.address);
      }

      // 🔥 CART LOAD (IMPORTANT FIX)
      const snap = await getDocs(collection(db,"carts",u.uid,"items"));

      const arr:any[] = [];

      snap.forEach(doc=>{
        const d = doc.data();

        console.log("🔥 CART ITEM:", d); // DEBUG

        arr.push({
          id: doc.id,
          name: d.name,
          price: d.price,
          discount: d.discount || 0,
          quantity: d.quantity || 1,
          image: d.image || "",
          variations: d.variations || []
        });
      });

      console.log("🔥 FINAL CART:", arr);

      setItems(arr);

      // SHIPPING
      const shipDoc = await getDoc(doc(db,"config","shipping"));
      if(shipDoc.exists()){
        setShippingConfig(shipDoc.data());
      }

    });

    return ()=>unsub();
  },[]);

  /* 💰 TOTAL */
  const total = items.reduce((sum,i)=>{
    const price = getFinalPrice(i);
    return sum + price * i.quantity;
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
    } else if(coupon.toUpperCase() === "FLAT50"){
      setCouponDiscount(50);
    } else {
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
    const msg = `Order placed!\nAmount: ₹${grandTotal}`;
    window.open(`https://wa.me/919876543210?text=${encodeURIComponent(msg)}`);
  };

  /* 🛒 ORDER */
  const placeOrder = async()=>{

    if(items.length === 0){
      alert("Cart empty ❌");
      return;
    }

    if(!customer.firstName || !customer.phone){
      alert("Fill details");
      return;
    }

    setLoading(true);

    await addDoc(collection(db,"orders"),{
      userId: user?.uid,
      items,
      total: grandTotal,
      paymentMethod: payment,
      createdAt: serverTimestamp()
    });

    sendWhatsApp();
    router.push("/order-success");

    setLoading(false);
  };

  return (

<div className="min-h-screen bg-gray-100 pb-32">

{/* DEBUG */}
<div className="bg-black text-green-400 p-2 text-xs">
{JSON.stringify({items, total, shippingCharge, grandTotal}, null, 2)}
</div>

<div className="max-w-xl mx-auto">

{/* HEADER */}
<div className="bg-white p-4 border-b">
  <h1 className="font-semibold">Checkout</h1>
</div>

{/* ❌ EMPTY CART */}
{items.length === 0 && (
  <div className="p-4 text-red-500 font-semibold">
    ❌ Cart Empty (Firestore issue)
  </div>
)}

{/* 🛒 CART ITEMS */}
<div className="p-4 space-y-3">
{items.map((i,index)=>(
  <div key={index} className="bg-white p-3 rounded-xl flex gap-3 shadow">

    <img src={i.image} className="w-16 h-16 rounded object-cover"/>

    <div className="flex-1">
      <p className="font-medium">{i.name}</p>
      <p className="text-sm text-gray-500">Qty: {i.quantity}</p>
      <p className="font-bold">₹{getFinalPrice(i)}</p>
    </div>

  </div>
))}
</div>

{/* DELIVERY */}
<div className="px-4">
  <div className="bg-white p-4 rounded-xl shadow text-sm">
    🚚 Delivery by <b>{getDeliveryDate()}</b>
  </div>
</div>

{/* PAYMENT */}
<div className="p-4 space-y-3">

<div onClick={()=>setPayment("cod")}
className={`p-4 bg-white rounded-xl border ${payment==="cod"?"border-pink-500":""}`}>
  Cash on Delivery (+₹{shippingConfig.cod})
</div>

<div onClick={()=>setPayment("online")}
className={`p-4 bg-white rounded-xl border ${payment==="online"?"border-pink-500":""}`}>
  Pay Online (₹10 OFF)
</div>

</div>

{/* ADDRESS */}
<div className="p-4">
<input placeholder="Name" className="w-full border p-2 mb-2"
value={customer.firstName}
onChange={(e)=>setCustomer({...customer,firstName:e.target.value})}
/>

<input placeholder="Phone" className="w-full border p-2 mb-2"
value={customer.phone}
onChange={(e)=>setCustomer({...customer,phone:e.target.value})}
/>

<textarea placeholder="Address" className="w-full border p-2"
value={customer.address}
onChange={(e)=>setCustomer({...customer,address:e.target.value})}
/>
</div>

{/* SUMMARY */}
<div className="p-4 bg-white m-4 rounded-xl shadow">
  <p>Items Total: ₹{total}</p>
  <p>Shipping: ₹{shippingCharge}</p>
  <p>Discount: ₹{couponDiscount + onlineDiscount}</p>
  <p className="font-bold text-lg">Total: ₹{grandTotal}</p>
</div>

{/* BUTTON */}
<div className="fixed bottom-0 w-full bg-white p-4 border-t">
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

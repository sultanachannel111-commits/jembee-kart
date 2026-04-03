"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  deleteDoc
} from "firebase/firestore";

export default function CheckoutPage(){

  const router = useRouter();

  const [user,setUser] = useState<any>(null);
  const [items,setItems] = useState<any[]>([]);
  const [offers,setOffers] = useState<any>({});
  const [loading,setLoading] = useState(false);

  const [coupon,setCoupon] = useState("");
  const [couponDiscount,setCouponDiscount] = useState(0);

  const [payment,setPayment] = useState("cod");

  const [shippingConfig,setShippingConfig] = useState({
    cod:60,
    prepaid:40
  });

  /* 🔥 BASE PRICE */
  const getBasePrice = (item:any)=>{
    return Number(
      item?.variations?.[0]?.sizes?.[0]?.sellPrice ||
      item?.price || 0
    );
  };

  /* 🔥 FINAL PRICE (OFFER + TIME FIX) */
  const getFinalPrice = (item:any)=>{

    const base = getBasePrice(item);

    const offer = Object.values(offers).find(
      (o:any)=> o.productId === item.id && o.active === true
    );

    if(!offer) return base;

    const now = new Date();
    const end = offer.endDate ? new Date(offer.endDate) : null;

    if(end && now > end){
      return base; // expired
    }

    const final = Math.round(base - (base * offer.discount / 100));

    return final > 0 ? final : base;
  };

  /* 🔄 LOAD DATA */
  useEffect(()=>{

    const unsub = onAuthStateChanged(auth, async(u)=>{
      if(!u) return;

      setUser(u);

      /* CART */
      const snap = await getDocs(
        collection(db,"carts",u.uid,"items")
      );

      const arr:any[] = [];

      snap.forEach(doc=>{
        const d:any = doc.data();

        arr.push({
          id:doc.id,
          name:d.name,
          quantity:d.quantity || 1,
          image:d.image || "",
          variations:d.variations || [],
          price:d.price || 0
        });
      });

      setItems(arr);

      /* OFFERS */
      const offerSnap = await getDocs(collection(db,"offers"));
      const off:any = {};

      offerSnap.forEach(doc=>{
        off[doc.id] = doc.data();
      });

      setOffers(off);

      /* SHIPPING */
      const ship = await getDoc(doc(db,"config","shipping"));
      if(ship.exists()){
        setShippingConfig(ship.data() as any);
      }

    });

    return ()=>unsub();

  },[]);

  /* 💰 TOTAL */
  const itemsTotal = items.reduce(
    (s,i)=> s + (getFinalPrice(i)*i.quantity),
    0
  );

  const shipping =
    payment==="cod"
      ? shippingConfig.cod
      : shippingConfig.prepaid;

  const total =
    Math.max(0, itemsTotal - couponDiscount) + shipping;

  /* 🎟️ COUPON */
  const applyCoupon = async()=>{

    const snap = await getDoc(
      doc(db,"coupons",coupon.toUpperCase())
    );

    if(!snap.exists()){
      alert("Invalid coupon ❌");
      return;
    }

    const d:any = snap.data();

    let discount = 0;

    if(d.type==="flat"){
      discount = d.value;
    }

    if(d.type==="percent"){
      discount = Math.round(itemsTotal * d.value / 100);
    }

    setCouponDiscount(discount);

    alert("Coupon Applied ✅");
  };

  /* 🧹 CLEAR CART */
  const clearCart = async()=>{
    const snap = await getDocs(
      collection(db,"carts",user.uid,"items")
    );

    for(const d of snap.docs){
      await deleteDoc(
        doc(db,"carts",user.uid,"items",d.id)
      );
    }
  };

  /* 📦 PLACE ORDER */
  const placeOrder = async()=>{

    if(!user) return alert("Login first");

    try{
      setLoading(true);

      const cleanItems = items.map(i=>({
        id:i.id,
        name:i.name,
        price:getFinalPrice(i),
        quantity:i.quantity
      }));

      const ref = await addDoc(
        collection(db,"orders"),
        {
          userId:user.uid,
          items:cleanItems,
          total,
          paymentMethod:payment,
          createdAt:serverTimestamp()
        }
      );

      await clearCart();

      window.open(`https://wa.me/?text=Order ₹${total}`);

      router.push(`/order-success/${ref.id}`);

    }catch(err:any){
      alert(err.message);
    }finally{
      setLoading(false);
    }
  };

  return(
<div className="min-h-screen bg-gradient-to-br from-pink-200 via-white to-purple-200 p-4 pb-28">

<h1 className="text-2xl font-bold text-center mb-4">
Checkout 🛍️
</h1>

{/* ITEMS */}
<div className="space-y-3">
{items.map(i=>{

  const offer = Object.values(offers).find(
    (o:any)=>o.productId === i.id
  );

  return(
<div key={i.id}
className="bg-white/60 backdrop-blur p-3 rounded-2xl shadow flex gap-3">

<img src={i.image || "/no.png"}
className="w-20 h-20 rounded-xl"/>

<div className="flex-1">
<p>{i.name}</p>

<p className="text-green-600 font-bold">
₹{getFinalPrice(i)}
</p>

<p className="text-xs line-through text-gray-400">
₹{getBasePrice(i)}
</p>

<p className="text-xs">Qty: {i.quantity}</p>

{/* 🔥 PER ITEM DEBUG */}
<pre className="bg-black text-green-400 text-[10px] mt-2 p-2 rounded overflow-auto">
{JSON.stringify({
  productId:i.id,
  offer,
  final:getFinalPrice(i)
},null,2)}
</pre>

</div>

</div>
)})}
</div>

{/* COUPON */}
<div className="bg-white/60 backdrop-blur p-3 mt-4 rounded-2xl flex gap-2">
<input
value={coupon}
onChange={e=>setCoupon(e.target.value)}
placeholder="Enter coupon"
className="flex-1 p-2 border rounded"
/>
<button onClick={applyCoupon}
className="bg-black text-white px-4 rounded-xl">
Apply
</button>
</div>

{/* PAYMENT */}
<div className="bg-white/60 backdrop-blur p-3 mt-4 rounded-2xl space-y-2">

<div onClick={()=>setPayment("cod")}
className={`p-3 rounded-xl border ${payment==="cod" && "border-pink-500"}`}>
Cash on Delivery (+₹{shippingConfig.cod})
</div>

<div onClick={()=>setPayment("online")}
className={`p-3 rounded-xl border ${payment==="online" && "border-pink-500"}`}>
Online Payment (+₹{shippingConfig.prepaid})
</div>

</div>

{/* SUMMARY */}
<div className="bg-white/60 backdrop-blur p-3 mt-4 rounded-2xl">

<div className="flex justify-between">
<span>Items</span>
<span>₹{itemsTotal}</span>
</div>

<div className="flex justify-between">
<span>Shipping</span>
<span>₹{shipping}</span>
</div>

<div className="flex justify-between text-green-600">
<span>Coupon</span>
<span>-₹{couponDiscount}</span>
</div>

<hr className="my-2"/>

<div className="flex justify-between font-bold text-lg">
<span>Total</span>
<span>₹{total}</span>
</div>

</div>

{/* 🔥 FULL DEBUG */}
<div className="mt-4 p-3 bg-black text-green-400 text-xs rounded-xl overflow-auto">
<pre>
{JSON.stringify({
  items,
  offers,
  itemsTotal,
  couponDiscount,
  total
},null,2)}
</pre>
</div>

{/* BUTTON */}
<div className="fixed bottom-0 left-0 w-full p-3">
<button onClick={placeOrder}
className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-2xl">
{loading ? "Processing..." : "Place Order 🚀"}
</button>
</div>

</div>
  );
}

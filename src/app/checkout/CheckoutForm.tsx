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
  const [loading,setLoading] = useState(false);

  const [customer,setCustomer] = useState({
    name:"",
    phone:"",
    address:""
  });

  const [payment,setPayment] = useState("cod");

  const [shippingConfig,setShippingConfig] = useState({
    cod:60,
    prepaid:40
  });

  const [coupon,setCoupon] = useState("");
  const [couponDiscount,setCouponDiscount] = useState(0);

  /* 🔥 SAFE PRICE + DEBUG */
  const getPrice = (item:any)=>{
    try{
      const vPrice = item?.variations?.[0]?.sizes?.[0]?.sellPrice;

      console.log("🔍 PRICE CHECK:", {
        name:item.name,
        vPrice,
        base:item.price
      });

      if(vPrice && vPrice > 0) return Number(vPrice);
      if(item.price && item.price > 0) return Number(item.price);

      console.warn("⚠️ PRICE ZERO ITEM:", item);
      return 0;

    }catch(err){
      console.error("PRICE ERROR:", err);
      return 0;
    }
  };

  /* 🔄 LOAD DATA */
  useEffect(()=>{

    const unsub = onAuthStateChanged(auth, async(u)=>{
      if(!u) return;

      console.log("👤 USER:", u.uid);
      setUser(u);

      const snap = await getDocs(
        collection(db,"carts",u.uid,"items")
      );

      console.log("🛒 CART COUNT:", snap.docs.length);

      const arr:any[] = [];

      snap.forEach(doc=>{
        const d:any = doc.data();

        console.log("📦 RAW ITEM:", d);

        const item = {
          id:doc.id,
          name:d.name || "",
          price:
            Number(d?.variations?.[0]?.sizes?.[0]?.sellPrice) ||
            Number(d?.price) ||
            0,
          quantity:d.quantity || 1,
          image:d.image || "",
          sellerId:d.sellerId || "",
          variations:d.variations || []
        };

        console.log("✅ FINAL ITEM:", item);

        arr.push(item);
      });

      setItems(arr);

      const userSnap = await getDoc(doc(db,"users",u.uid));

      if(userSnap.exists()){
        const d:any = userSnap.data();

        console.log("👤 USER DATA:", d);

        if(typeof d.address === "object"){
          setCustomer({
            name:d.address?.firstName || "",
            phone:d.address?.phone || "",
            address:d.address?.address || ""
          });
        }
      }

      const ship = await getDoc(doc(db,"config","shipping"));
      if(ship.exists()){
        console.log("🚚 SHIPPING CONFIG:", ship.data());
        setShippingConfig(ship.data() as any);
      }

    });

    return ()=>unsub();

  },[]);

  /* 💰 TOTAL */
  const itemsTotal = items.reduce(
    (s,i)=> s + (getPrice(i)*i.quantity),
    0
  );

  const shipping =
    payment==="cod"
      ? shippingConfig.cod
      : shippingConfig.prepaid;

  const total =
    Math.max(0, itemsTotal - couponDiscount) + shipping;

  /* 🔍 TOTAL DEBUG */
  useEffect(()=>{
    console.log("💰 TOTAL DEBUG:", {
      itemsTotal,
      couponDiscount,
      shipping,
      total
    });

    if(itemsTotal === 0 && items.length > 0){
      alert("⚠️ PRICE BUG DETECTED");
    }

  },[items, couponDiscount, payment]);

  /* 🎟️ COUPON */
  const applyCoupon = async()=>{
    console.log("🎟️ APPLY:", coupon);

    const snap = await getDoc(
      doc(db,"coupons",coupon.toUpperCase())
    );

    if(!snap.exists()){
      console.error("❌ INVALID COUPON");
      alert("Invalid coupon ❌");
      return;
    }

    const d:any = snap.data();
    console.log("✅ COUPON DATA:", d);

    if(d.type==="flat") setCouponDiscount(d.value);
    if(d.type==="percent")
      setCouponDiscount(Math.round(itemsTotal*d.value/100));

    alert("Coupon Applied ✅");
  };

  /* 💸 COMMISSION */
  const calcCommission = (i:any)=>{
    const price = getPrice(i);
    const commission = price * 0.2;

    return {
      sellerAmount: price - commission,
      commission
    };
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

    console.log("🧹 CART CLEARED");
  };

  /* 📦 PLACE ORDER */
  const placeOrder = async()=>{

    if(!user) return alert("Login first");
    if(items.length===0) return alert("Cart empty");

    try{
      setLoading(true);

      const cleanItems = items.map(i=>{
        const c = calcCommission(i);

        return {
          id:i.id,
          name:i.name,
          price:getPrice(i),
          quantity:i.quantity,
          sellerId:i.sellerId,
          sellerAmount:c.sellerAmount,
          commission:c.commission,
          image:i.image || ""
        };
      });

      console.log("📦 ORDER DATA:", {
        items:cleanItems,
        total,
        customer
      });

      const ref = await addDoc(
        collection(db,"orders"),
        {
          userId:user.uid,
          items:cleanItems,
          total,
          paymentMethod:payment,
          paymentStatus:"pending",
          address:customer,
          status:"Placed",
          createdAt:serverTimestamp()
        }
      );

      await clearCart();

      window.open(`https://wa.me/?text=Order%20₹${total}`);

      router.push(`/order-success/${ref.id}`);

    }catch(err:any){
      console.error("❌ ORDER ERROR:", err);
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
{items.map(i=>(
<div key={i.id}
className="bg-white/60 backdrop-blur p-3 rounded-2xl shadow flex gap-3">

<img src={i.image || "/no.png"}
className="w-20 h-20 rounded-xl"/>

<div>
<p>{i.name}</p>
<p className="text-green-600 font-bold">
₹{getPrice(i)}
</p>
<p className="text-xs">Qty: {i.quantity}</p>
</div>

</div>
))}
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

{/* ADDRESS */}
<div className="bg-white/60 backdrop-blur p-3 mt-4 rounded-2xl space-y-2">
<input value={customer.name}
onChange={e=>setCustomer({...customer,name:e.target.value})}
className="w-full p-2 border rounded"/>

<input value={customer.phone}
onChange={e=>setCustomer({...customer,phone:e.target.value})}
className="w-full p-2 border rounded"/>

<textarea value={customer.address}
onChange={e=>setCustomer({...customer,address:e.target.value})}
className="w-full p-2 border rounded"/>
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
<span>Discount</span>
<span>-₹{couponDiscount}</span>
</div>

<hr className="my-2"/>

<div className="flex justify-between font-bold text-lg">
<span>Total</span>
<span>₹{total}</span>
</div>

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

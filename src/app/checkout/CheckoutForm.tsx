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
  const [debug,setDebug] = useState<any>({});

  const [coupon,setCoupon] = useState("");
  const [couponDiscount,setCouponDiscount] = useState(0);

  /* 🔥 PRICE */
  const getBasePrice = (item:any)=>{
    const price =
      Number(item?.variations?.[0]?.sizes?.[0]?.sellPrice) ||
      Number(item?.price) ||
      0;

    console.log("💰 BASE PRICE:", item.id, price);

    return price;
  };

  /* 🔥 DISCOUNT */
  const getDiscountedPrice = (item:any)=>{
    const base = getBasePrice(item);
    const discount = offers?.[item.id] || 0;

    console.log("🎯 OFFER CHECK:", {
      productId: item.id,
      discount
    });

    const final = Math.round(base - (base * discount / 100));

    return final > 0 ? final : base;
  };

  /* 🔄 LOAD */
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

        console.log("📦 CART ITEM:", d);

        arr.push({
          id:doc.id,
          name:d.name,
          quantity:d.quantity || 1,
          price:d.price || 0,
          variations:d.variations || []
        });
      });

      setItems(arr);

      /* OFFERS */
      const offerSnap = await getDocs(collection(db,"offers"));
      const off:any = {};

      offerSnap.forEach(d=>{
        const data:any = d.data();

        console.log("🔥 OFFER RAW:", d.id, data);

        off[d.id] = data.discount || 0;
      });

      console.log("🧠 FINAL OFFERS MAP:", off);

      setOffers(off);

    });

    return ()=>unsub();

  },[]);

  /* 💰 TOTAL */
  const itemsTotal = items.reduce(
    (s,i)=> s + (getDiscountedPrice(i)*i.quantity),
    0
  );

  /* 🎟️ COUPON */
  const applyCoupon = async()=>{

    console.log("🎟️ APPLY:", coupon);

    const snap = await getDoc(
      doc(db,"coupons",coupon.toUpperCase())
    );

    if(!snap.exists()){
      console.log("❌ COUPON NOT FOUND");
      alert("Invalid coupon ❌");
      return;
    }

    const d:any = snap.data();
    console.log("✅ COUPON DATA:", d);

    let discount = 0;

    if(d.type==="percent"){
      discount = Math.round(itemsTotal*d.value/100);
    }

    if(d.type==="flat"){
      discount = d.value;
    }

    console.log("🎯 COUPON DISCOUNT:", discount);

    setCouponDiscount(discount);
  };

  /* DEBUG STATE */
  useEffect(()=>{
    setDebug({
      items,
      offers,
      itemsTotal,
      couponDiscount
    });

    console.log("📊 FULL DEBUG:", {
      items,
      offers,
      itemsTotal,
      couponDiscount
    });

  },[items,offers,couponDiscount]);

  return(
<div className="p-4 space-y-4">

<h1 className="text-xl font-bold text-center">
DEBUG CHECKOUT 🔥
</h1>

{/* ITEMS */}
{items.map(i=>(
<div key={i.id} className="p-3 bg-white rounded shadow">

<p>{i.name}</p>

<p>Base: ₹{getBasePrice(i)}</p>
<p>Discounted: ₹{getDiscountedPrice(i)}</p>

<p className="text-xs text-gray-500">
ID: {i.id}
</p>

</div>
))}

{/* COUPON */}
<div className="flex gap-2">
<input
value={coupon}
onChange={e=>setCoupon(e.target.value)}
placeholder="coupon"
className="border p-2 flex-1"
/>
<button onClick={applyCoupon}
className="bg-black text-white px-4">
Apply
</button>
</div>

{/* TOTAL */}
<div className="p-3 bg-green-100 rounded">
<p>Items Total: ₹{itemsTotal}</p>
<p>Coupon: -₹{couponDiscount}</p>
<p>Final: ₹{itemsTotal - couponDiscount}</p>
</div>

{/* 🧠 DEBUG PANEL */}
<div className="bg-black text-white p-3 rounded text-xs overflow-auto">
<pre>
{JSON.stringify(debug,null,2)}
</pre>
</div>

</div>
  );
}

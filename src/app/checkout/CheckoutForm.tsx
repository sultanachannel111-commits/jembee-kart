"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { load } from "@cashfreepayments/cashfree-js";

/* 🔥 PRICE */
const getFinalPrice = (item:any)=>{
  const price =
    Number(item?.variations?.[0]?.sizes?.[0]?.sellPrice) ||
    Number(item?.price) ||
    0;

  const discount = Number(item?.discount) || 0;

  return discount > 0
    ? Math.round(price - (price * discount)/100)
    : price;
};

export default function CheckoutPage(){

  const router = useRouter();

  const [user,setUser] = useState<any>(null);
  const [items,setItems] = useState<any[]>([]);
  const [loading,setLoading] = useState(false);

  const [payment,setPayment] = useState("cod");

  const [customer,setCustomer] = useState({
    firstName:"",
    phone:"",
    address:""
  });

  const [coupon,setCoupon] = useState("");
  const [couponData,setCouponData] = useState<any>(null);

  /* 🔥 LOAD */
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async(u)=>{
      if(!u) return;

      setUser(u);

      // 🛒 CART
      const snap = await getDocs(collection(db,"carts",u.uid,"items"));
      const arr:any[] = [];

      snap.forEach(doc=>{
        const d = doc.data();
        arr.push({
          id: doc.id,
          name: d.name || "",
          price: Number(d.price) || 0,
          quantity: Number(d.quantity) || 1,
          image: d.image || "",
          discount: d.discount || 0,
          variations: d.variations || []
        });
      });

      setItems(arr);

      // 👤 PROFILE AUTO FILL
      const userSnap = await getDoc(doc(db,"users",u.uid));

      if(userSnap.exists()){
        const d:any = userSnap.data();

        if(typeof d.address === "object"){
          setCustomer({
            firstName: d.address?.firstName || "",
            phone: d.address?.phone || "",
            address: d.address?.address || ""
          });
        }
      }

    });

    return ()=>unsub();
  },[]);

  /* 💰 TOTAL */
  const total = items.reduce(
    (sum,i)=> sum + getFinalPrice(i)*(i.quantity||1),
    0
  );

  const shipping = payment === "cod" ? 60 : 40;

  /* 🎟️ COUPON */
  const applyCoupon = async()=>{
    const ref = doc(db,"coupons",coupon.toUpperCase());
    const snap = await getDoc(ref);

    if(!snap.exists()){
      alert("Invalid coupon ❌");
      return;
    }

    const data:any = snap.data();
    setCouponData(data);
    alert("Coupon applied ✅");
  };

  const couponDiscount = couponData
    ? couponData.type === "flat"
      ? couponData.value
      : Math.round((total * couponData.value)/100)
    : 0;

  const finalTotal = Math.max(0, total - couponDiscount + shipping);

  /* 🛒 ORDER */
  const placeOrder = async()=>{

    if(!user) return alert("Login first");
    if(items.length===0) return alert("Cart empty");

    try{
      setLoading(true);

      // save address to profile
      await setDoc(doc(db,"users",user.uid),{
        address: customer
      },{merge:true});

      const ref = await addDoc(collection(db,"orders"),{
        userId:user.uid,
        items,
        total:finalTotal,
        address:customer,
        paymentMethod:payment,
        status:"Placed",
        createdAt:serverTimestamp()
      });

      /* 💳 ONLINE */
      if(payment === "online"){

        const res = await fetch("/api/cashfree",{
          method:"POST",
          body:JSON.stringify({
            amount: finalTotal,
            customer
          })
        });

        const data = await res.json();
        const cashfree = await load({ mode:"sandbox" });

        await cashfree.checkout({
          paymentSessionId:data.payment_session_id,
          redirectTarget:"_self"
        });

      }else{
        router.push(`/order-success/${ref.id}`);
      }

    }catch(err:any){
      alert(err.message);
    }finally{
      setLoading(false);
    }
  };

  return(
<div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 pb-32">

<div className="max-w-xl mx-auto p-4 space-y-4">

{/* 🛒 ITEMS */}
{items.map((i,index)=>(
<div key={index}
className="bg-white/70 backdrop-blur p-3 rounded-xl shadow flex gap-3">

<img src={i.image || "/no-image.png"}
className="w-20 h-20 rounded object-cover"/>

<div className="flex-1">
<p className="text-sm font-medium">{i.name}</p>
<p className="text-pink-600 font-bold">₹{getFinalPrice(i)}</p>
<p className="text-xs text-gray-500">Qty: {i.quantity}</p>
</div>

</div>
))}

{/* 🎟️ COUPON */}
<div className="bg-white/70 backdrop-blur p-4 rounded-xl shadow flex gap-2">
<input
value={coupon}
onChange={(e)=>setCoupon(e.target.value)}
placeholder="Enter coupon"
className="flex-1 border p-2 rounded"
/>
<button onClick={applyCoupon}
className="bg-black text-white px-4 rounded">
Apply
</button>
</div>

{/* 📍 ADDRESS */}
<div className="bg-white/70 backdrop-blur p-4 rounded-xl shadow space-y-2">
<input value={customer.firstName}
onChange={(e)=>setCustomer({...customer,firstName:e.target.value})}
placeholder="Name"
className="w-full border p-2 rounded"/>

<input value={customer.phone}
onChange={(e)=>setCustomer({...customer,phone:e.target.value})}
placeholder="Phone"
className="w-full border p-2 rounded"/>

<textarea value={customer.address}
onChange={(e)=>setCustomer({...customer,address:e.target.value})}
placeholder="Address"
className="w-full border p-2 rounded"/>
</div>

{/* 💳 PAYMENT */}
<div className="bg-white/70 backdrop-blur p-4 rounded-xl shadow space-y-2">
<div onClick={()=>setPayment("cod")}
className={`p-3 border rounded ${payment==="cod"?"border-pink-500":""}`}>
Cash on Delivery (+₹60)
</div>

<div onClick={()=>setPayment("online")}
className={`p-3 border rounded ${payment==="online"?"border-pink-500":""}`}>
Online Payment (+₹40)
</div>
</div>

{/* 💰 SUMMARY */}
<div className="bg-white/70 backdrop-blur p-4 rounded-xl shadow space-y-2">

<div className="flex justify-between text-sm">
<span>Items Total</span>
<span>₹{total}</span>
</div>

<div className="flex justify-between text-sm">
<span>Shipping</span>
<span>₹{shipping}</span>
</div>

<div className="flex justify-between text-sm text-green-600">
<span>Discount</span>
<span>-₹{couponDiscount}</span>
</div>

<hr/>

<div className="flex justify-between font-bold text-lg">
<span>Total</span>
<span>₹{finalTotal}</span>
</div>

</div>

</div>

{/* 🔻 BOTTOM BAR */}
<div className="fixed bottom-0 w-full bg-white p-4 flex justify-between items-center shadow">

<div>
<p className="text-sm text-gray-500">Total</p>
<p className="font-bold text-lg">₹{finalTotal}</p>
</div>

<button onClick={placeOrder}
className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl">
{loading?"Processing...":"Place Order"}
</button>

</div>

</div>
  );
}

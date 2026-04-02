"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { load } from "@cashfreepayments/cashfree-js";

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

  /* 🔥 PRICE */
  const getPrice = (i:any)=>{
    return Number(
      i?.variations?.[0]?.sizes?.[0]?.sellPrice ||
      i?.price || 0
    );
  };

  /* 🔄 LOAD */
  useEffect(()=>{

    const unsub = onAuthStateChanged(auth, async(u)=>{
      if(!u) return;

      setUser(u);

      // 🛒 CART
      const snap = await getDocs(
        collection(db,"carts",u.uid,"items")
      );

      const arr:any[] = [];

      snap.forEach(doc=>{
        const d:any = doc.data();

        arr.push({
          id:doc.id,
          name:d.name || "",
          price:getPrice(d),
          quantity:d.quantity || 1,
          image:d.image || "",
          sellerId:d.sellerId || "",
          variations:d.variations || []
        });
      });

      setItems(arr);

      // 👤 PROFILE
      const userSnap = await getDoc(doc(db,"users",u.uid));

      if(userSnap.exists()){
        const d:any = userSnap.data();

        if(typeof d.address === "object"){
          setCustomer({
            name:d.address?.firstName || "",
            phone:d.address?.phone || "",
            address:d.address?.address || ""
          });
        }
      }

      // 🚚 SHIPPING
      const ship = await getDoc(doc(db,"config","shipping"));
      if(ship.exists()){
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

  /* 🎟️ COUPON */
  const applyCoupon = async()=>{

    if(!coupon) return;

    const snap = await getDoc(
      doc(db,"coupons",coupon.toUpperCase())
    );

    if(!snap.exists()){
      alert("Invalid coupon ❌");
      return;
    }

    const d:any = snap.data();

    if(d.type==="flat"){
      setCouponDiscount(d.value);
    }

    if(d.type==="percent"){
      setCouponDiscount(
        Math.round(itemsTotal*d.value/100)
      );
    }

    alert("Applied ✅");
  };

  /* 💸 SELLER COMMISSION */
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
  };

  /* 📦 PLACE ORDER */
  const placeOrder = async()=>{

    if(!user) return alert("Login first");
    if(items.length===0) return alert("Cart empty");
    if(!customer.name || !customer.phone)
      return alert("Fill details");

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

          image:i.image || "",
          variations:i.variations || []
        };
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
          status:"Pending",
          createdAt:serverTimestamp()
        }
      );

      // 💳 ONLINE
      if(payment==="online"){

        const res = await fetch("/api/create-order",{
          method:"POST",
          body:JSON.stringify({
            amount: total,
            userId:user.uid,
            name:customer.name,
            phone:customer.phone
          })
        });

        const data = await res.json();

        const cashfree = await load({mode:"sandbox"});

        await cashfree.checkout({
          paymentSessionId:data.paymentSessionId,
          returnUrl:`${window.location.origin}/order-success/${ref.id}`
        });

        return;
      }

      // 🟢 COD
      await clearCart();

      // 📤 WhatsApp
      window.open(
        `https://wa.me/?text=Order%20Placed%20₹${total}`
      );

      router.push(`/order-success/${ref.id}`);

    }catch(err:any){
      alert(err.message);
    }finally{
      setLoading(false);
    }
  };

  return(
<div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 pb-28">

<h1 className="text-xl font-bold mb-3">Checkout</h1>

{/* ITEMS */}
<div className="space-y-3">
{items.map(i=>(
<div key={i.id}
className="bg-white/70 backdrop-blur p-3 rounded-xl shadow flex gap-3">

<img src={i.image || "/no.png"}
className="w-20 h-20 rounded"/>

<div className="flex-1">
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
<div className="bg-white p-3 mt-4 rounded-xl flex gap-2">
<input
value={coupon}
onChange={e=>setCoupon(e.target.value)}
placeholder="Coupon"
className="flex-1 border p-2 rounded"
/>
<button onClick={applyCoupon}
className="bg-black text-white px-4 rounded">
Apply
</button>
</div>

{/* ADDRESS */}
<div className="bg-white p-3 mt-4 rounded-xl space-y-2">
<input value={customer.name}
onChange={e=>setCustomer({...customer,name:e.target.value})}
placeholder="Name"
className="w-full border p-2 rounded"/>

<input value={customer.phone}
onChange={e=>setCustomer({...customer,phone:e.target.value})}
placeholder="Phone"
className="w-full border p-2 rounded"/>

<textarea value={customer.address}
onChange={e=>setCustomer({...customer,address:e.target.value})}
placeholder="Address"
className="w-full border p-2 rounded"/>
</div>

{/* PAYMENT */}
<div className="bg-white p-3 mt-4 rounded-xl space-y-2">

<div onClick={()=>setPayment("cod")}
className={`p-3 border rounded ${payment==="cod"&&"border-pink-500"}`}>
Cash on Delivery (+₹{shippingConfig.cod})
</div>

<div onClick={()=>setPayment("online")}
className={`p-3 border rounded ${payment==="online"&&"border-pink-500"}`}>
Online Payment (+₹{shippingConfig.prepaid})
</div>

</div>

{/* SUMMARY */}
<div className="bg-white p-3 mt-4 rounded-xl text-sm">

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

<hr/>

<div className="flex justify-between font-bold text-lg">
<span>Total</span>
<span>₹{total}</span>
</div>

</div>

{/* BUTTON */}
<div className="fixed bottom-0 left-0 w-full bg-white p-3">
<button onClick={placeOrder}
className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl">
{loading ? "Processing..." : "Place Order"}
</button>
</div>

</div>
  );
}

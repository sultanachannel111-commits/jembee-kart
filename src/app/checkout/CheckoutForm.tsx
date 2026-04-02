"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

/* 🔥 PRICE FIX (NO AUTO FAKE DISCOUNT) */
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

  /* 🔥 LOAD CART */
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async (u)=>{
      if(!u) return;

      setUser(u);

      try{
        const snap = await getDocs(collection(db,"carts",u.uid,"items"));

        const arr:any[] = [];

        snap.forEach(doc=>{
          const d = doc.data();

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

        console.log("CART DATA:", arr);

        setItems(arr);

      }catch(err){
        console.error("CART ERROR:", err);
      }

      // shipping config load
      const shipDoc = await getDoc(doc(db,"config","shipping"));
      if(shipDoc.exists()){
        setShippingConfig(shipDoc.data() as any);
      }

    });

    return ()=>unsub();
  },[]);

  /* 💰 TOTAL */
  const total = items.reduce(
    (sum,i)=> sum + getFinalPrice(i)*(i.quantity||1),
    0
  );

  /* 💸 DISCOUNT */
  const onlineDiscount = payment === "online" ? 10 : 0;

  const finalPay = Math.max(0, total - couponDiscount - onlineDiscount);

  /* 🚚 SHIPPING */
  const shippingCharge =
    payment === "cod"
      ? shippingConfig.cod
      : shippingConfig.prepaid;

  const grandTotal = finalPay + shippingCharge;

  /* 🎟️ COUPON */
  const applyCoupon = () => {
    if(coupon.toUpperCase() === "SAVE10"){
      setCouponDiscount(10);
    } else if(coupon.toUpperCase() === "FLAT50"){
      setCouponDiscount(50);
    } else {
      alert("Invalid coupon ❌");
    }
  };

  /* 🛒 ORDER */
  const placeOrder = async()=>{

    if(!user){
      alert("Login first ❌");
      return;
    }

    if(items.length === 0){
      alert("Cart empty ❌");
      return;
    }

    if(!customer.firstName || !customer.phone){
      alert("Fill details ❌");
      return;
    }

    try{
      setLoading(true);

      const ref = await addDoc(collection(db,"orders"),{
        userId: user.uid,
        items,
        total: grandTotal,
        paymentMethod: payment,
        address: customer,
        createdAt: serverTimestamp()
      });

      console.log("ORDER SUCCESS:", ref.id);

      alert("Order placed ✅");

      router.push("/order-success");

    }catch(err:any){
      console.error("ORDER ERROR:", err);
      alert("Error: " + err.message); // 🔥 REAL ERROR
    }finally{
      setLoading(false);
    }
  };

  return (

<div className="min-h-screen bg-gray-100 pb-32">

<div className="max-w-xl mx-auto">

{/* HEADER */}
<div className="bg-white p-4 border-b">
  <h1 className="font-semibold">Checkout</h1>
</div>

{/* CART ITEMS */}
<div className="p-4 space-y-3">
{items.length === 0 && (
  <p className="text-center text-red-500">Cart empty ❌</p>
)}

{items.map((i,index)=>{

  const price = getFinalPrice(i);
  const original =
    Number(i?.variations?.[0]?.sizes?.[0]?.sellPrice) ||
    Number(i.price);

  return(
  <div key={index} className="bg-white p-3 rounded-xl flex gap-3 shadow">

    <img 
      src={i.image || "/no-image.png"} 
      className="w-20 h-20 rounded object-cover border"
    />

    <div className="flex-1">

      <p className="font-medium">{i.name}</p>

      <div className="flex gap-2 items-center">
        <p className="text-green-600 font-bold">₹{price}</p>

        {price !== original && (
          <p className="line-through text-gray-400 text-sm">
            ₹{original}
          </p>
        )}
      </div>

    </div>

  </div>
)})}
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

{/* COUPON */}
<div className="p-4">
  <div className="bg-white p-4 rounded-xl shadow flex gap-2">
    <input
      value={coupon}
      onChange={(e)=>setCoupon(e.target.value)}
      placeholder="Enter coupon"
      className="flex-1 border p-2 rounded"
    />
    <button onClick={applyCoupon} className="bg-black text-white px-4 rounded">
      Apply
    </button>
  </div>
</div>

{/* ADDRESS */}
<div className="p-4 space-y-2">
<input placeholder="Name" className="w-full border p-2"
value={customer.firstName}
onChange={(e)=>setCustomer({...customer,firstName:e.target.value})}
/>

<input placeholder="Phone" className="w-full border p-2"
value={customer.phone}
onChange={(e)=>setCustomer({...customer,phone:e.target.value})}
/>

<textarea placeholder="Address" className="w-full border p-2"
value={customer.address}
onChange={(e)=>setCustomer({...customer,address:e.target.value})}
/>
</div>

{/* SUMMARY */}
<div className="p-4 bg-white m-4 rounded-xl shadow space-y-2">

  <div className="flex justify-between text-sm">
    <span>Items Total</span>
    <span>₹{total}</span>
  </div>

  <div className="flex justify-between text-sm">
    <span>Shipping</span>
    <span>₹{shippingCharge}</span>
  </div>

  <div className="flex justify-between text-sm text-green-600">
    <span>Discount</span>
    <span>-₹{couponDiscount + onlineDiscount}</span>
  </div>

  <hr/>

  <div className="flex justify-between font-bold text-lg">
    <span>Total</span>
    <span>₹{grandTotal}</span>
  </div>

</div>

{/* BUTTON */}
<div className="fixed bottom-0 w-full bg-white border-t p-3">
<button
onClick={placeOrder}
className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl"
>
{loading ? "Processing..." : "Place Order"}
</button>
</div>

</div>
</div>

  );
}

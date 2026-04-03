"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";

import {
  collection,
  onSnapshot,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  getDoc
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

import { getOfferPrice } from "@/utils/pricing";

export default function CheckoutPage() {

  const [items, setItems] = useState<any[]>([]);
  const [offers, setOffers] = useState<any>({});
  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);

  const [coupon, setCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);

  const [payment, setPayment] = useState("COD");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // 🔥 LOAD EVERYTHING
  useEffect(() => {

    let unsubscribe:any;

    const unsubAuth = onAuthStateChanged(auth, async (u) => {

      if (!u) return router.push("/login");

      setUser(u);

      // 🔥 ADDRESS (default)
      const addrSnap = await getDocs(collection(db, "users", u.uid, "addresses"));
      let defaultAddr:any = null;

      addrSnap.forEach(d=>{
        const data:any = d.data();
        if(data.isDefault) defaultAddr = data;
      });

      setAddress(defaultAddr);

      // 🔥 BUY NOW
      const buyNow = localStorage.getItem("buy-now");

      if (buyNow) {
        try {
          setItems([JSON.parse(buyNow)]);
        } catch {}
      }

      // 🔥 CART
      const itemsRef = collection(db, "carts", u.uid, "items");

      unsubscribe = onSnapshot(itemsRef, (snap) => {

        if (buyNow) return;

        const arr:any[] = [];

        snap.forEach(docSnap => {
          arr.push({
            ...docSnap.data(),
            cartId: docSnap.id
          });
        });

        setItems(arr);
      });

      // 🔥 OFFERS
      const offSnap = await getDocs(collection(db, "offers"));
      const off:any = {};

      offSnap.forEach(d=>{
        off[d.id] = d.data();
      });

      setOffers(off);

    });

    return ()=>{
      unsubAuth();
      if(unsubscribe) unsubscribe();
    };

  }, []);

  // 💰 TOTAL
  const itemsTotal = items.reduce((sum,item)=>{
    return sum + getOfferPrice(item,offers)*(item.quantity||1);
  },0);

  const shipping = payment==="COD" ? 60 : 40;

  const total = Math.max(0, itemsTotal + shipping - couponDiscount);

  // 🎟 COUPON
  const applyCoupon = () => {

    if (coupon === "SAVE50") setCouponDiscount(50);
    else if (coupon === "FLAT100") setCouponDiscount(100);
    else {
      alert("Invalid coupon ❌");
      setCouponDiscount(0);
    }
  };

  // 🚀 PLACE ORDER (FINAL)
  const placeOrder = async () => {

    if (!user) return alert("Login required");
    if (!address) return alert("Add address first");
    if (items.length === 0) return alert("Cart empty");

    setLoading(true);

    try {

      // 🔥 CREATE ORDER
      const orderRef = await addDoc(collection(db,"orders"),{
        userId:user.uid,
        items,
        address,
        itemsTotal,
        shipping,
        couponDiscount,
        total,
        paymentMethod:payment,
        status:"Pending",
        createdAt:serverTimestamp()
      });

      // 💳 ONLINE PAYMENT
      if(payment==="ONLINE"){

        const res = await fetch("/api/cashfree",{
          method:"POST",
          headers:{ "Content-Type":"application/json"},
          body:JSON.stringify({
            orderId:orderRef.id,
            amount:total,
            customer:user
          })
        });

        const data = await res.json();

        if(data.payment_session_id){

          const { load } = await import("@cashfreepayments/cashfree-js");

          const cashfree = await load({
            mode:"sandbox" // 🔥 production me change
          });

          cashfree.checkout({
            paymentSessionId:data.payment_session_id,
            redirectTarget:"_self"
          });

          return;
        }

        alert("Payment failed ❌");
        setLoading(false);
        return;
      }

      // 📦 COD FLOW
      for(const item of items){
        if(item.cartId){
          await deleteDoc(doc(db,"carts",user.uid,"items",item.cartId));
        }
      }

      await updateDoc(orderRef,{status:"Placed"});

      localStorage.removeItem("buy-now");

      router.push(`/success?orderId=${orderRef.id}&total=${total}`);

    } catch (err) {
      console.log(err);
      alert("Something went wrong ❌");
      setLoading(false);
    }

  };

  return (
    <div className="min-h-screen p-4 pb-32 bg-gradient-to-br from-purple-200 via-pink-100 to-white">

      <h1 className="text-3xl font-bold text-center mb-6">
        Checkout 🛍
      </h1>

      {/* 📍 ADDRESS */}
      {address ? (
        <div className="bg-white p-4 rounded-2xl mb-3 shadow">
          <p className="font-semibold">{address.label}</p>
          <p>{address.address}</p>
          <p>{address.city} - {address.pincode}</p>
        </div>
      ):(
        <button
          onClick={()=>router.push("/profile")}
          className="bg-red-500 text-white p-3 rounded-xl w-full mb-3"
        >
          Add Address
        </button>
      )}

      {/* 🛒 ITEMS */}
      {items.map((item,i)=>(
        <div key={i} className="bg-white p-4 rounded-2xl mb-3 shadow">
          <p className="font-semibold">{item.name}</p>
          <p className="text-green-600 font-bold">
            ₹{getOfferPrice(item,offers)}
          </p>
        </div>
      ))}

      {/* 🎟 COUPON */}
      <div className="flex gap-2 mt-4">
        <input
          value={coupon}
          onChange={(e)=>setCoupon(e.target.value)}
          placeholder="Enter coupon"
          className="flex-1 border p-2 rounded-xl"
        />
        <button
          onClick={applyCoupon}
          className="bg-black text-white px-4 rounded-xl"
        >
          Apply
        </button>
      </div>

      {/* 💳 PAYMENT */}
      <div className="mt-4 space-y-2">

        <button
          onClick={()=>setPayment("COD")}
          className={`w-full p-3 rounded-xl border ${
            payment==="COD" ? "border-pink-500 bg-pink-50" : ""
          }`}
        >
          Cash on Delivery (+₹60)
        </button>

        <button
          onClick={()=>setPayment("ONLINE")}
          className={`w-full p-3 rounded-xl border ${
            payment==="ONLINE" ? "border-pink-500 bg-pink-50" : ""
          }`}
        >
          Online Payment (+₹40)
        </button>

      </div>

      {/* 💰 SUMMARY */}
      <div className="mt-6 bg-white p-4 rounded-2xl shadow">

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

        <div className="flex justify-between font-bold text-xl">
          <span>Total</span>
          <span>₹{total}</span>
        </div>

      </div>

      {/* 🚀 BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-3">

        <button
          onClick={placeOrder}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 rounded-2xl font-bold"
        >
          {loading ? "Processing..." : "Place Order 🚀"}
        </button>

      </div>

      {/* 🐞 DEBUG */}
      <div className="mt-6 bg-black text-green-400 text-xs p-3 rounded-xl overflow-auto">
        <pre>
{JSON.stringify({items,address,total},null,2)}
        </pre>
      </div>

    </div>
  );
}

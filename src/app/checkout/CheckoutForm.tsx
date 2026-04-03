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
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

import { getOfferPrice } from "@/utils/pricing";

export default function CheckoutPage() {

  const [items, setItems] = useState<any[]>([]);
  const [offers, setOffers] = useState<any>({});
  const [user, setUser] = useState<any>(null);

  const [coupon, setCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);

  const [payment, setPayment] = useState("COD");

  const router = useRouter();

  // 🔥 LOAD USER + CART
  useEffect(() => {

    let unsubscribe:any;

    const unsubAuth = onAuthStateChanged(auth, async (u) => {

      if (u) {

        setUser(u);

        const itemsRef = collection(db, "carts", u.uid, "items");

        unsubscribe = onSnapshot(itemsRef, (snap) => {

          const arr:any[] = [];

          snap.forEach(docSnap => {
            const d:any = docSnap.data();

            arr.push({
              ...d,
              cartId: docSnap.id
            });
          });

          setItems(arr);
        });

        // 🔥 OFFERS LOAD
        const offSnap = await getDocs(collection(db, "offers"));
        const off:any = {};

        offSnap.forEach(d=>{
          off[d.id] = d.data();
        });

        setOffers(off);
      }

    });

    return ()=>{
      unsubAuth();
      if(unsubscribe) unsubscribe();
    };

  }, []);

  // 💰 TOTAL CALCULATION
  const itemsTotal = items.reduce((sum, item) => {

    const base =
      item?.variations?.[0]?.sizes?.[0]?.sellPrice ||
      item.price ||
      0;

    const final = getOfferPrice(item, offers);

    return sum + (final || base) * (item.quantity || 1);

  }, 0);

  const shipping = payment === "COD" ? 60 : 40;

  const total = Math.max(0, itemsTotal + shipping - couponDiscount);

  // 🎟 COUPON
  const applyCoupon = () => {

    if (coupon === "SAVE50") {
      setCouponDiscount(50);
    }
    else if (coupon === "FLAT100") {
      setCouponDiscount(100);
    }
    else {
      alert("Invalid coupon ❌");
      setCouponDiscount(0);
    }
  };

  // 🚀 PLACE ORDER (REAL)
  const placeOrder = async () => {

    if (!user) return alert("Login required");
    if (items.length === 0) return alert("Cart empty");

    // 🔥 ORDER DATA
    const orderData = {
      userId: user.uid,
      items,
      itemsTotal,
      shipping,
      couponDiscount,
      total,
      paymentMethod: payment,
      status: "Placed",
      createdAt: serverTimestamp()
    };

    // 🔥 SAVE ORDER
    const ref = await addDoc(collection(db, "orders"), orderData);

    // 🔥 CLEAR CART
    for (const item of items) {
      await deleteDoc(doc(db, "carts", user.uid, "items", item.cartId));
    }

    // 🔥 REDIRECT
    router.push(`/success?orderId=${ref.id}&total=${total}`);
  };

  return (
    <div className="min-h-screen p-4 pb-32 bg-gradient-to-br from-purple-200 via-pink-100 to-white">

      <h1 className="text-3xl font-bold text-center mb-6">
        Checkout 🛍
      </h1>

      {/* ITEMS */}
      {items.map((item,i)=>(
        <div key={i} className="bg-white p-4 rounded-2xl mb-3 shadow">

          <p className="font-semibold">{item.name}</p>

          <p className="text-green-600 font-bold">
            ₹{getOfferPrice(item, offers)}
          </p>

        </div>
      ))}

      {/* COUPON */}
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

      {/* PAYMENT */}
      <div className="mt-4 space-y-2">
        <button
          onClick={()=>setPayment("COD")}
          className={`w-full p-3 rounded-xl border ${
            payment==="COD" ? "border-pink-500" : ""
          }`}
        >
          Cash on Delivery (+₹60)
        </button>

        <button
          onClick={()=>setPayment("ONLINE")}
          className={`w-full p-3 rounded-xl border ${
            payment==="ONLINE" ? "border-pink-500" : ""
          }`}
        >
          Online Payment (+₹40)
        </button>
      </div>

      {/* SUMMARY */}
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

      {/* BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-3">

        <button
          onClick={placeOrder}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 rounded-2xl font-bold"
        >
          Place Order 🚀
        </button>

      </div>

    </div>
  );
}

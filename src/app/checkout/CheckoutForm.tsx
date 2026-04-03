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
  updateDoc
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

import { getOfferPrice } from "@/utils/pricing";

export default function CheckoutPage() {

  const [items, setItems] = useState<any[]>([]);
  const [offers, setOffers] = useState<any>({});
  const [user, setUser] = useState<any>(null);

  const [payment, setPayment] = useState("COD");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // 🔥 LOAD DATA
  useEffect(() => {

    let unsubscribe:any;

    const unsubAuth = onAuthStateChanged(auth, async (u) => {

      if (!u) return;
      setUser(u);

      // BUY NOW
      const buyNow = localStorage.getItem("buy-now");
      if (buyNow) {
        setItems([JSON.parse(buyNow)]);
      }

      // CART
      const ref = collection(db, "carts", u.uid, "items");

      unsubscribe = onSnapshot(ref, (snap) => {
        const arr:any[] = [];

        snap.forEach(d=>{
          arr.push({ ...d.data(), cartId: d.id });
        });

        if (!buyNow) setItems(arr);
      });

      // OFFERS
      const offSnap = await getDocs(collection(db, "offers"));
      const off:any = {};
      offSnap.forEach(d=> off[d.id] = d.data());

      setOffers(off);
    });

    return ()=>{
      unsubAuth();
      if(unsubscribe) unsubscribe();
    };

  }, []);

  // 💰 TOTAL
  const itemsTotal = items.reduce((sum, item) => {

    const price =
      getOfferPrice(item, offers) ||
      item?.variations?.[0]?.sizes?.[0]?.basePrice ||
      item?.price ||
      0;

    return sum + price * (item.quantity || 1);

  }, 0);

  const shipping = payment === "COD" ? 60 : 40;
  const total = itemsTotal + shipping;

  // 🚀 PLACE ORDER
  const placeOrder = async () => {

    if (!user) return alert("Login required");
    if (items.length === 0) return alert("Cart empty");

    setLoading(true);

    try {

      const orderRef = await addDoc(collection(db, "orders"), {
        userId: user.uid,
        items,
        itemsTotal,
        shipping,
        total,
        paymentMethod: payment,
        status: "Pending",
        createdAt: serverTimestamp()
      });

      // 💳 ONLINE PAYMENT
      if (payment === "ONLINE") {

        const res = await fetch("/api/cashfree", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            orderId: orderRef.id,
            amount: total,
            customer: {
              uid: user.uid,
              email: user.email,
              phone: "9999999999",
              firstName: user.displayName || "User"
            }
          })
        });

        const data = await res.json();

        console.log("CASHFREE:", data);

        if (data.payment_session_id) {

          const { load } = await import("@cashfreepayments/cashfree-js");

          const cashfree = await load({ mode: "sandbox" });

          cashfree.checkout({
            paymentSessionId: data.payment_session_id,
            redirectTarget: "_self"
          });

          return;

        } else {
          alert(data?.message || "Payment failed ❌");
          setLoading(false);
          return;
        }
      }

      // 📦 COD FLOW
      for (const item of items) {
        if (item.cartId) {
          await deleteDoc(doc(db, "carts", user.uid, "items", item.cartId));
        }
      }

      await updateDoc(orderRef, { status: "Placed" });

      localStorage.removeItem("buy-now");

      router.push(`/payment-success?orderId=${orderRef.id}`);

    } catch (err) {
      console.log(err);
      alert("Something went wrong ❌");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen p-4 pb-32 bg-gradient-to-br from-purple-200 via-pink-100 to-white">

      <h1 className="text-3xl font-bold text-center mb-6">
        Checkout 🛍
      </h1>

      {/* ITEMS */}
      {items.map((item,i)=>{

        const price =
          getOfferPrice(item, offers) ||
          item?.variations?.[0]?.sizes?.[0]?.basePrice ||
          item?.price || 0;

        return (
          <div key={i} className="bg-white p-4 rounded-2xl mb-3 shadow">
            <p>{item.name}</p>
            <p className="text-green-600 font-bold">₹{price}</p>
          </div>
        );
      })}

      {/* PAYMENT */}
      <div className="mt-4 space-y-2">

        <button onClick={()=>setPayment("COD")}
          className={`w-full p-3 rounded-xl border ${
            payment==="COD" ? "border-pink-500 bg-pink-50" : ""
          }`}
        >
          COD (+₹60)
        </button>

        <button onClick={()=>setPayment("ONLINE")}
          className={`w-full p-3 rounded-xl border ${
            payment==="ONLINE" ? "border-pink-500 bg-pink-50" : ""
          }`}
        >
          Online (+₹40)
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
          {loading ? "Processing..." : "Place Order 🚀"}
        </button>
      </div>

      {/* DEBUG */}
      <div className="mt-6 bg-black text-green-400 text-xs p-3 rounded-xl">
        <pre>{JSON.stringify({items,total},null,2)}</pre>
      </div>

    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function CheckoutPage() {

  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState("ONLINE");

  const [user, setUser] = useState(null);
  const [address, setAddress] = useState(null);

  const [shippingConfig, setShippingConfig] = useState({
    prepaid: 40,
    cod: 60,
    freeShippingAbove: 500
  });

  // 🛒 DEMO ITEMS
  const items = [
    {
      name: "Orange T-shirt",
      price: 500,
      qty: 1,
      image: "https://via.placeholder.com/100"
    }
  ];

  // 🔐 USER + ADDRESS LOAD
  useEffect(() => {

    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) return;
      setUser(u);

      // 📍 ADDRESS LOAD
      const addrSnap = await getDoc(doc(db, "users", u.uid));

      if (addrSnap.exists()) {
        setAddress(addrSnap.data().address || null);
      }
    });

    return () => unsub();

  }, []);

  // 🚚 SHIPPING LOAD (FIXED)
  useEffect(() => {

    const loadShipping = async () => {
      const snap = await getDoc(doc(db, "config", "shipping")); // ✅ FIX

      if (snap.exists()) {
        setShippingConfig(snap.data());
      }
    };

    loadShipping();

  }, []);

  // 💰 TOTAL
  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  // 🚚 SHIPPING LOGIC (MEESHO STYLE)
  let shipping = 0;

  if (itemsTotal >= shippingConfig.freeShippingAbove) {
    shipping = payment === "COD" ? shippingConfig.cod : 0;
  } else {
    shipping = payment === "COD"
      ? shippingConfig.cod
      : shippingConfig.prepaid;
  }

  const total = itemsTotal + shipping;

  // 🚀 PAYMENT
  const placeOrder = async () => {

    if (!address) {
      alert("Please add address ❌");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        orderId: "order_" + Date.now(),
        amount: total,
        customer: {
          uid: user.uid,
          email: user.email,
          phone: address.phone || "9999999999",
          firstName: address.name || "User"
        }
      };

      const res = await fetch("/api/cashfree", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!data.payment_session_id) {
        alert("Payment failed ❌");
        return;
      }

      const { load } = await import("@cashfreepayments/cashfree-js");

      const cashfree = await load({ mode: "production" });

      cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
      });

    } catch (err) {
      alert(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen p-4 pb-28 bg-gradient-to-br from-purple-200 via-pink-100 to-white">

      <h1 className="text-3xl font-bold text-center mb-6">
        Checkout 🛍
      </h1>

      {/* 📍 ADDRESS */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">

        <h2 className="font-bold mb-2">Delivery Address</h2>

        {address ? (
          <div className="text-sm">
            <p>{address.name}</p>
            <p>{address.phone}</p>
            <p>{address.city}, {address.state}</p>
            <p>{address.pincode}</p>
          </div>
        ) : (
          <p className="text-red-500 text-sm">
            No address found ❌
          </p>
        )}

      </div>

      {/* 🛒 ITEMS */}
      {items.map((item, i) => (
        <div key={i} className="bg-white p-3 rounded-xl shadow mb-3 flex gap-3">
          <img src={item.image} className="w-16 h-16 rounded" />
          <div>
            <p>{item.name}</p>
            <p>Qty: {item.qty}</p>
            <p className="text-green-600 font-bold">₹{item.price}</p>
          </div>
        </div>
      ))}

      {/* 💳 PAYMENT */}
      <div className="space-y-3 mt-4">

        <div onClick={()=>setPayment("ONLINE")}
          className={`p-3 border rounded-xl ${
            payment==="ONLINE" ? "bg-pink-50 border-pink-500" : ""
          }`}
        >
          💳 Online (+₹{shippingConfig.prepaid})
        </div>

        <div onClick={()=>setPayment("COD")}
          className={`p-3 border rounded-xl ${
            payment==="COD" ? "bg-pink-50 border-pink-500" : ""
          }`}
        >
          📦 COD (+₹{shippingConfig.cod})
        </div>

      </div>

      {/* 💰 SUMMARY */}
      <div className="bg-white p-4 rounded-xl mt-6 shadow">

        <div className="flex justify-between">
          <span>Items</span>
          <span>₹{itemsTotal}</span>
        </div>

        <div className="flex justify-between">
          <span>Shipping</span>
          <span>₹{shipping}</span>
        </div>

        <hr className="my-2"/>

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₹{total}</span>
        </div>

      </div>

      {/* 🚀 BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-3">

        <button
          onClick={placeOrder}
          className="w-full py-4 rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-500"
        >
          {loading ? "Processing..." : `Pay ₹${total} 🚀`}
        </button>

      </div>

    </div>
  );
}

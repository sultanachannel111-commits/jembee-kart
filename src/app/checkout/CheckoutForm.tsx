"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function CheckoutPage() {

  const [user, setUser] = useState(null);
  const [address, setAddress] = useState(null);

  const [payment, setPayment] = useState("ONLINE");
  const [loading, setLoading] = useState(false);

  const [shippingConfig, setShippingConfig] = useState({
    prepaid: 40,
    cod: 60,
    freeShippingAbove: 500
  });

  // 🛒 DEMO ITEMS (later cart se connect karna)
  const items = [
    {
      name: "Orange T-shirt",
      price: 500,
      qty: 1,
      image: "https://via.placeholder.com/100"
    }
  ];

  // 🔐 LOAD USER + ADDRESS (MEESHO STYLE)
  useEffect(() => {

    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) return;

      setUser(u);

      // 📍 GET ALL ADDRESSES
      const addrSnap = await getDocs(
        collection(db, "users", u.uid, "address")
      );

      let defaultAddress = null;

      addrSnap.forEach(doc => {
        const data = doc.data();

        if (data.isDefault) {
          defaultAddress = data;
        }
      });

      // ❗ fallback
      if (!defaultAddress && addrSnap.docs.length > 0) {
        defaultAddress = addrSnap.docs[0].data();
      }

      setAddress(defaultAddress);
    });

    return () => unsub();

  }, []);

  // 🚚 LOAD SHIPPING CONFIG
  useEffect(() => {

    const loadShipping = async () => {

      const snap = await getDoc(doc(db, "config", "shipping"));

      if (snap.exists()) {
        setShippingConfig(snap.data());
      }
    };

    loadShipping();

  }, []);

  // 💰 CALCULATE
  const itemsTotal = items.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );

  let shipping = 0;

  if (itemsTotal >= shippingConfig.freeShippingAbove) {
    shipping = payment === "COD" ? shippingConfig.cod : 0;
  } else {
    shipping =
      payment === "COD"
        ? shippingConfig.cod
        : shippingConfig.prepaid;
  }

  const total = itemsTotal + shipping;

  // 🚀 PLACE ORDER
  const placeOrder = async () => {

    if (!address) {
      alert("Add address first ❌");
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

      const cashfree = await load({
        mode: "production"
      });

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
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-white p-4 pb-28">

      {/* HEADER */}
      <h1 className="text-3xl font-bold text-center mb-6">
        Checkout 🛍
      </h1>

      {/* 📍 ADDRESS */}
      <div className="bg-white p-4 rounded-2xl shadow mb-4">

        <div className="flex justify-between mb-2">
          <h2 className="font-bold">Delivery Address</h2>
          <button
            onClick={() => location.href = "/profile"}
            className="text-pink-500 text-sm"
          >
            Change
          </button>
        </div>

        {address ? (
          <div className="text-sm space-y-1">
            <p className="font-semibold">{address.name}</p>
            <p>{address.phone}</p>
            <p>{address.address}</p>
            <p>
              {address.city}, {address.state} - {address.pincode}
            </p>
          </div>
        ) : (
          <p className="text-red-500 text-sm">
            No address found ❌
          </p>
        )}

      </div>

      {/* 🛒 ITEMS */}
      {items.map((item, i) => (
        <div key={i} className="flex gap-3 bg-white p-3 rounded-2xl shadow mb-3">

          <img
            src={item.image}
            className="w-16 h-16 rounded-lg"
          />

          <div className="flex-1">
            <p className="font-semibold">{item.name}</p>
            <p className="text-gray-500 text-sm">
              Qty: {item.qty}
            </p>
            <p className="text-green-600 font-bold">
              ₹{item.price}
            </p>
          </div>

        </div>
      ))}

      {/* 💳 PAYMENT */}
      <div className="mt-4 space-y-3">

        <div
          onClick={() => setPayment("ONLINE")}
          className={`p-3 rounded-xl border cursor-pointer ${
            payment === "ONLINE"
              ? "border-pink-500 bg-pink-50"
              : ""
          }`}
        >
          💳 Online Payment (+₹{shippingConfig.prepaid})
        </div>

        <div
          onClick={() => setPayment("COD")}
          className={`p-3 rounded-xl border cursor-pointer ${
            payment === "COD"
              ? "border-pink-500 bg-pink-50"
              : ""
          }`}
        >
          📦 Cash on Delivery (+₹{shippingConfig.cod})
        </div>

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
          className={`w-full py-4 rounded-2xl text-white font-bold ${
            loading
              ? "bg-gray-400"
              : "bg-gradient-to-r from-purple-600 to-pink-500"
          }`}
        >
          {loading
            ? "Processing..."
            : `Pay ₹${total} 🚀`}
        </button>

      </div>

    </div>
  );
}

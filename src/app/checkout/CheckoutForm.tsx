"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function CheckoutPage() {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState("ONLINE");

  const [shippingConfig, setShippingConfig] = useState({
    online: 40,
    cod: 60
  });

  // 🛒 DEMO ITEMS (replace with real cart later)
  const items = [
    {
      name: "Orange T-shirt",
      price: 500,
      qty: 1,
      image: "https://via.placeholder.com/100"
    }
  ];

  // 🔥 LOAD SHIPPING FROM FIREBASE
  useEffect(() => {

    const loadShipping = async () => {

      try {
        const snap = await getDoc(doc(db, "settings", "shipping"));

        if (snap.exists()) {
          setShippingConfig(snap.data());
        }

      } catch (err) {
        console.log("Shipping load error:", err);
      }
    };

    loadShipping();

  }, []);

  // 💰 CALCULATIONS
  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const shipping =
    payment === "COD"
      ? shippingConfig.cod
      : shippingConfig.online;

  const total = itemsTotal + shipping;

  // 🚀 PLACE ORDER
  const placeOrder = async () => {

    try {
      setLoading(true);
      setError("");

      const payload = {
        orderId: "order_" + Date.now(),
        amount: total,
        customer: {
          uid: "user_123",
          email: "test@gmail.com",
          phone: "9876543210",
          firstName: "User"
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
        setError("Payment failed ❌");
        setLoading(false);
        return;
      }

      const { load } = await import("@cashfreepayments/cashfree-js");

      const cashfree = await load({
        mode: "production"
      });

      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
      });

    } catch (err) {
      setError(err.message || "Error occurred");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-white p-4 pb-28">

      <h1 className="text-3xl font-bold text-center mb-6">
        Checkout 🛍
      </h1>

      {/* 🛒 ITEMS */}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 bg-white p-3 rounded-xl shadow">

            <img src={item.image} className="w-16 h-16 rounded-lg" />

            <div className="flex-1">
              <p className="font-semibold">{item.name}</p>
              <p className="text-gray-500 text-sm">Qty: {item.qty}</p>
              <p className="text-green-600 font-bold">₹{item.price}</p>
            </div>

          </div>
        ))}
      </div>

      {/* 💳 PAYMENT METHOD */}
      <div className="mt-6 space-y-3">

        <div
          onClick={() => setPayment("ONLINE")}
          className={`p-3 rounded-xl border cursor-pointer ${
            payment === "ONLINE" ? "border-pink-500 bg-pink-50" : ""
          }`}
        >
          💳 Online Payment (+₹{shippingConfig.online})
        </div>

        <div
          onClick={() => setPayment("COD")}
          className={`p-3 rounded-xl border cursor-pointer ${
            payment === "COD" ? "border-pink-500 bg-pink-50" : ""
          }`}
        >
          📦 Cash on Delivery (+₹{shippingConfig.cod})
        </div>

      </div>

      {/* 💰 SUMMARY */}
      <div className="mt-6 bg-white p-4 rounded-xl shadow space-y-2">

        <div className="flex justify-between">
          <span>Items</span>
          <span>₹{itemsTotal}</span>
        </div>

        <div className="flex justify-between">
          <span>Shipping</span>
          <span>₹{shipping}</span>
        </div>

        <hr />

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₹{total}</span>
        </div>

      </div>

      {/* ❌ ERROR */}
      {error && (
        <div className="mt-4 bg-red-100 text-red-600 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* 🚀 BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-3 bg-white shadow-lg">

        <button
          onClick={placeOrder}
          disabled={loading}
          className={`w-full py-4 rounded-xl text-white font-bold ${
            loading
              ? "bg-gray-400"
              : "bg-gradient-to-r from-purple-600 to-pink-500"
          }`}
        >
          {loading ? "Processing..." : `Pay ₹${total} 🚀`}
        </button>

      </div>

    </div>
  );
}

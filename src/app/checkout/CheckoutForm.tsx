"use client";

import { useState } from "react";

export default function CheckoutPage() {

  const [loading, setLoading] = useState(false);

  const placeOrder = async () => {

    setLoading(true);

    const payload = {
      orderId: "order_" + Date.now(),
      amount: 500,
      customer: {
        uid: "123",
        email: "realemail@gmail.com",
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

    console.log("🔥 RESPONSE:", data);
    alert(JSON.stringify(data, null, 2));

    if (data.payment_session_id) {

      const { load } = await import("@cashfreepayments/cashfree-js");

      const cashfree = await load({ mode: "production" }); // 🔥 LIVE

      cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
      });

    } else {
      alert("Payment failed");
    }

    setLoading(false);
  };

  return (
    <div className="p-6">

      <h1 className="text-xl mb-4">Checkout</h1>

      <button
        onClick={placeOrder}
        className="bg-black text-white p-3"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>

    </div>
  );
}

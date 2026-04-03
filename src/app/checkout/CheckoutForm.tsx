"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {

  const [user, setUser] = useState(null);
  const [address, setAddress] = useState(null);

  const [payment, setPayment] = useState("COD");
  const [loading, setLoading] = useState(false);

  const [shippingConfig, setShippingConfig] = useState({
    prepaid: 0,
    cod: 0,
    freeShippingAbove: 0
  });

  // ✅ SUCCESS MODAL
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  const router = useRouter();

  // 🛒 DEMO ITEMS (later cart se replace karna)
  const items = [
    {
      name: "Orange T-shirt",
      price: 500,
      qty: 1,
      image: "https://via.placeholder.com/100"
    }
  ];

  // 🔥 LOAD USER + ADDRESS + SHIPPING
  useEffect(() => {

    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) return router.push("/login");

      setUser(u);

      // ADDRESS
      const addrSnap = await getDocs(
        collection(db, "users", u.uid, "addresses")
      );

      let defaultAddr = null;

      addrSnap.forEach(d => {
        if (d.data().isDefault) defaultAddr = d.data();
      });

      setAddress(defaultAddr);

      // SHIPPING CONFIG
      const shipSnap = await getDoc(doc(db, "config", "shipping"));

      if (shipSnap.exists()) {
        setShippingConfig(shipSnap.data());
      }

    });

    return () => unsub();

  }, []);

  // 💰 CALCULATION
  const itemsTotal = items.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );

  let shipping =
    payment === "COD"
      ? Number(shippingConfig.cod || 0)
      : Number(shippingConfig.prepaid || 0);

  if (itemsTotal >= Number(shippingConfig.freeShippingAbove || 0)) {
    shipping = 0;
  }

  const total = itemsTotal + shipping;

  // 🚀 PLACE ORDER
  const placeOrder = async () => {

    if (!address) {
      alert("Please add address ❌");
      return;
    }

    try {
      setLoading(true);

      // ✅ SAVE ORDER IN FIRESTORE
      const orderData = {
        userId: user.uid,
        items,
        itemsTotal,
        shipping,
        total,
        paymentMethod: payment,
        status: "Pending",
        address,
        createdAt: serverTimestamp()
      };

      const ref = await addDoc(collection(db, "orders"), orderData);

      // 💳 ONLINE PAYMENT
      if (payment === "ONLINE") {

        const payload = {
          orderId: ref.id,
          amount: total,
          customer: {
            uid: user.uid,
            email: address.email || user.email,
            phone: address.phone,
            firstName: address.name
          }
        };

        const res = await fetch("/api/cashfree", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!data.payment_session_id) {
          alert("Payment failed ❌");
          setLoading(false);
          return;
        }

        const { load } = await import("@cashfreepayments/cashfree-js");

        const cashfree = await load({ mode: "production" });

        await cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          redirectTarget: "_self"
        });

        return;
      }

      // ✅ COD SUCCESS (NO ALERT 🔥)
      setOrderId(ref.id);
      setShowSuccess(true);

      setTimeout(() => {
        router.push("/profile");
      }, 2000);

    } catch (err) {
      alert("Error: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-white p-4 pb-28">

      <h1 className="text-3xl font-bold text-center mb-6">
        Checkout 🛍
      </h1>

      {/* ADDRESS */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">

        <div className="flex justify-between">
          <h2 className="font-bold">Delivery Address</h2>
          <button
            onClick={() => router.push("/profile")}
            className="text-pink-500"
          >
            Change
          </button>
        </div>

        {address ? (
          <div className="mt-2 text-sm space-y-1">
            <p className="font-semibold">{address.name}</p>
            <p>{address.phone}</p>
            <p>{address.email}</p>
            <p>{address.address}</p>
            <p>{address.city} - {address.pincode}</p>
          </div>
        ) : (
          <p className="text-red-500 mt-2">
            No address found ❌
          </p>
        )}

      </div>

      {/* ITEMS */}
      {items.map((item, i) => (
        <div key={i} className="flex gap-3 bg-white p-3 rounded-xl shadow mb-3">

          <img src={item.image} className="w-16 h-16 rounded-lg" />

          <div className="flex-1">
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-gray-500">Qty: {item.qty}</p>
            <p className="text-green-600 font-bold">₹{item.price}</p>
          </div>

        </div>
      ))}

      {/* PAYMENT */}
      <div className="mt-6 space-y-3">

        <div
          onClick={() => setPayment("ONLINE")}
          className={`p-3 rounded-xl border cursor-pointer ${
            payment === "ONLINE" ? "border-pink-500 bg-pink-50" : ""
          }`}
        >
          💳 Online Payment (+₹{shippingConfig.prepaid})
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

      {/* SUMMARY */}
      <div className="mt-6 bg-white p-4 rounded-xl shadow">

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

      {/* BUTTON */}
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

      {/* ✅ SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-2xl text-center w-[90%] max-w-sm shadow-xl">

            <div className="text-5xl mb-3">🎉</div>

            <h2 className="text-xl font-bold text-green-600">
              Order Placed Successfully
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Order ID: {orderId}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Redirecting to profile...
            </p>

          </div>

        </div>
      )}

    </div>
  );
}

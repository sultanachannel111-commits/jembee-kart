"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { load } from "@cashfreepayments/cashfree-js";

export default function CheckoutPage() {

  const [user, setUser] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState([]);
  const [refSeller, setRefSeller] = useState(null);

  const [shippingConfig, setShippingConfig] = useState({
    prepaid: 0,
    cod: 0,
    freeShippingAbove: 0
  });

  // DEBUG
  const [debugCreate, setDebugCreate] = useState("");
  const [debugError, setDebugError] = useState("");

  const router = useRouter();

  // 🔥 LOAD DATA
  useEffect(() => {

    const seller = localStorage.getItem("refSeller");
    setRefSeller(seller);

    const buyNow = localStorage.getItem("buy-now");

    if (buyNow) {
      const parsed = JSON.parse(buyNow);

      setItems([{
        ...parsed,
        qty: Number(parsed.quantity) || 1,
        price: Number(parsed.price) || 0,
        basePrice: Number(parsed.basePrice || parsed.price) || 0
      }]);
    }

    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) return router.push("/login");

      setUser(u);

      const addrSnap = await getDocs(
        collection(db, "users", u.uid, "addresses")
      );

      let defaultAddr = null;
      addrSnap.forEach(d => {
        if (d.data().isDefault) defaultAddr = d.data();
      });

      setAddress(defaultAddr);

      const shipSnap = await getDoc(doc(db, "config", "shipping"));

      if (shipSnap.exists()) {
        const data = shipSnap.data();

        setShippingConfig({
          prepaid: Number(data.prepaid) || 0,
          cod: Number(data.cod) || 0,
          freeShippingAbove: Number(data.freeShippingAbove) || 0
        });
      }

    });

    return () => unsub();

  }, []);

  // 💰 CALCULATION
  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  let shipping = shippingConfig.prepaid;

  if (shippingConfig.freeShippingAbove > 0 && itemsTotal >= shippingConfig.freeShippingAbove) {
    shipping = 0;
  }

  const total = itemsTotal + shipping;

  const totalProfit = items.reduce((sum, item) => {
    return sum + (item.price - item.basePrice) * item.qty;
  }, 0);

  const commission = refSeller ? Math.floor(totalProfit * 0.5) : 0;

  // 🚀 PAYMENT
  const handlePayment = async () => {

    if (!address) {
      alert("Add address ❌");
      return;
    }

    try {
      setLoading(true);
      setDebugError("");

      const res = await fetch("/api/cashfree/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: total,
          customer: {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            phone: address.phone
          }
        })
      });

      const text = await res.text();
      console.log("RAW:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setDebugError("❌ Not JSON → " + text);
        return;
      }

      setDebugCreate(JSON.stringify(data, null, 2));

      if (!data.payment_session_id) {
        setDebugError("❌ No session id");
        return;
      }

      const cashfree = await load({
        mode: "production" // ✅ REAL PAYMENT
      });

      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
      });

    } catch (err) {
      console.log(err);
      setDebugError(err.message);
      alert("Payment error ❌");
    }

    setLoading(false);
  };

  return (
    <div className="p-4 text-white">

      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      {/* DEBUG */}
      <div className="bg-black/70 p-3 rounded text-xs mb-4">
        <p>Seller: {refSeller || "None"}</p>
        <p>Profit: {totalProfit}</p>
        <p>Commission: {commission}</p>

        {items.map((item, i) => (
          <p key={i}>
            Item {i + 1}: {item.basePrice} → {item.price}
          </p>
        ))}

        <hr />

        <p>CreateOrder: {debugCreate}</p>
        <p className="text-red-400">Error: {debugError}</p>
      </div>

      {/* TOTAL */}
      <div className="mb-4">
        <p>Items: ₹{itemsTotal}</p>
        <p>Shipping: ₹{shipping}</p>
        <p>Total: ₹{total}</p>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className="bg-purple-600 px-4 py-3 rounded w-full"
      >
        {loading ? "Processing..." : `Pay ₹${total}`}
      </button>

    </div>
  );
}

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

  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<any[]>([]);
  const [refSeller, setRefSeller] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COD">("ONLINE");

  const [shippingConfig, setShippingConfig] = useState({
    prepaid: 0,
    cod: 0,
    freeShippingAbove: 0
  });

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

      let defaultAddr: any = null;
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

  // 💰 TOTAL
  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  let shipping =
    paymentMethod === "COD"
      ? shippingConfig.cod
      : shippingConfig.prepaid;

  if (
    shippingConfig.freeShippingAbove > 0 &&
    itemsTotal >= shippingConfig.freeShippingAbove
  ) {
    shipping = 0;
  }

  const total = itemsTotal + shipping;

  // 💰 PROFIT + COMMISSION
  const totalProfit = items.reduce((sum, item) => {
    return sum + (item.price - item.basePrice) * item.qty;
  }, 0);

  const commission = refSeller
    ? Math.floor(totalProfit * 0.5)
    : 0;

  // 🚀 PAYMENT
  const handlePayment = async () => {

    if (!address) {
      alert("Add address ❌");
      return;
    }

    // =====================
    // 🟡 COD ORDER
    // =====================
    if (paymentMethod === "COD") {

      const orderData = {
        userId: user.uid,
        items,
        itemsTotal,
        shipping,
        total,
        address,
        sellerRef: refSeller || null,
        paymentMethod: "COD",
        status: "PLACED"
      };

      // 👉 Yaha Firestore save kar sakta hai (optional)
      localStorage.removeItem("buy-now");

      alert("Order placed successfully (COD) ✅");
      router.push("/");

      return;
    }

    // =====================
    // 🟢 ONLINE PAYMENT
    // =====================

    try {
      setLoading(true);

      const orderData = {
        userId: user.uid,
        items,
        itemsTotal,
        shipping,
        total,
        address,
        sellerRef: refSeller || null
      };

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

      const data = await res.json();

      if (!data.payment_session_id) {
        alert("Payment error ❌");
        return;
      }

      const cashfree = await load({
        mode: process.env.NODE_ENV === "production" ? "production" : "sandbox"
      });

      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
      });

      localStorage.setItem("orderData", JSON.stringify({
        ...orderData,
        cashfreeOrderId: data.order_id
      }));

    } catch (err: any) {
      alert("Payment error ❌");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4 pb-32">

      <h1 className="text-3xl font-bold text-center text-white mb-6">
        Checkout 🛍
      </h1>

      {/* SUMMARY */}
      <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl p-4 shadow-xl text-white mb-4">

        <h2 className="font-semibold mb-2">💰 Order Summary</h2>

        <div className="flex justify-between">
          <span>Items</span>
          <span>₹{itemsTotal}</span>
        </div>

        <div className="flex justify-between">
          <span>Shipping</span>
          <span>₹{shipping}</span>
        </div>

        <hr className="my-2 border-white/30" />

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₹{total}</span>
        </div>

      </div>

      {/* ITEMS */}
      {items.map((item, i) => (
        <div key={i} className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-xl p-3 flex gap-3 mb-3 shadow text-white">

          <img src={item.image} className="w-16 h-16 rounded-lg object-cover" />

          <div className="flex-1">
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm opacity-80">Qty: {item.qty}</p>
            <p className="text-green-300 font-bold">₹{item.price}</p>
          </div>

        </div>
      ))}

      {/* PAYMENT OPTIONS */}
      <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-xl p-4 text-white mb-4">

        <h2 className="font-semibold mb-2">💳 Payment Method</h2>

        <div className="flex gap-3">

          <button
            onClick={() => setPaymentMethod("ONLINE")}
            className={`flex-1 py-2 rounded-xl ${
              paymentMethod === "ONLINE"
                ? "bg-green-500"
                : "bg-white/20"
            }`}
          >
            Online
          </button>

          <button
            onClick={() => setPaymentMethod("COD")}
            className={`flex-1 py-2 rounded-xl ${
              paymentMethod === "COD"
                ? "bg-yellow-500"
                : "bg-white/20"
            }`}
          >
            COD
          </button>

        </div>

      </div>

      {/* BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-3 backdrop-blur-xl bg-white/20 border-t border-white/30">

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-4 rounded-xl text-white font-bold bg-gradient-to-r from-purple-700 to-pink-600 shadow-xl"
        >
          {loading ? "Processing..." : `Pay ₹${total} 🚀`}
        </button>

      </div>

    </div>
  );
}

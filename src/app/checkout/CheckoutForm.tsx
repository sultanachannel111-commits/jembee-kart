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
import { load } from "@cashfreepayments/cashfree-js";

export default function CheckoutPage() {

  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);

  const [payment, setPayment] = useState("ONLINE");
  const [loading, setLoading] = useState(false);

  const [shippingConfig, setShippingConfig] = useState({
    prepaid: 0,
    cod: 0,
    freeShippingAbove: 0
  });

  const [items, setItems] = useState<any[]>([]);
  const [refSeller, setRefSeller] = useState<string | null>(null);

  // DEBUG
  const [debugCreate, setDebugCreate] = useState("");
  const [debugError, setDebugError] = useState("");

  const router = useRouter();

  // 🔥 LOAD
  useEffect(() => {

    if (typeof window !== "undefined") {
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
    }

    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) {
        router.push("/login");
        return;
      }

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

  let shipping = payment === "COD"
    ? shippingConfig.cod
    : shippingConfig.prepaid;

  if (shippingConfig.freeShippingAbove > 0 && itemsTotal >= shippingConfig.freeShippingAbove) {
    shipping = 0;
  }

  const total = itemsTotal + shipping;

  // 💰 PROFIT
  const totalProfit = items.reduce((sum, item) => {
    return sum + (item.price - item.basePrice) * item.qty;
  }, 0);

  const commission = refSeller ? Math.floor(totalProfit * 0.5) : 0;

  // 🚀 ONLINE PAYMENT (FINAL)
  const handleOnlinePayment = async () => {

    if (!address) {
      alert("Add address first ❌");
      return;
    }

    try {
      setLoading(true);
      setDebugError("");

      const res = await fetch("/api/orders/create", {
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

      console.log("CREATE:", data);
      setDebugCreate(JSON.stringify(data, null, 2));

      if (!data.payment_session_id) {
        setDebugError("No session id ❌");
        return;
      }

      const cashfree = await load({
        mode: process.env.NODE_ENV === "production" ? "production" : "sandbox"
      });

      // ✅ IMPORTANT: redirect use karo
      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
      });

    } catch (err: any) {
      console.log(err);
      setDebugError(err.message);
      alert("Payment error ❌");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4 pb-32">

      <h1 className="text-3xl font-bold text-center text-white mb-6">
        Checkout 🛍
      </h1>

      {/* DEBUG */}
      <div className="bg-black/70 text-white p-4 rounded-xl text-xs space-y-2 mb-4">
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

      {/* SUMMARY */}
      <div className="backdrop-blur-xl bg-white/20 border border-white/30 p-4 rounded-xl text-white">
        <p>Items: ₹{itemsTotal}</p>
        <p>Shipping: ₹{shipping}</p>
        <p className="font-bold">Total: ₹{total}</p>
      </div>

      {/* BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-3 backdrop-blur-xl bg-white/20">
        <button
          onClick={handleOnlinePayment}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-700 to-pink-600 text-white font-bold"
        >
          {loading ? "Processing..." : `Pay ₹${total} 🚀`}
        </button>
      </div>

    </div>
  );
}

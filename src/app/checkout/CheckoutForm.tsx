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
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");

  const [shippingConfig, setShippingConfig] = useState({
    prepaid: 0,
    cod: 0,
    freeShippingAbove: 0
  });

  const router = useRouter();

  // =========================
  // 🔥 BACK BUTTON → HOME REDIRECT
  // =========================
  useEffect(() => {
    const handleBack = () => {
      router.replace("/");
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBack);

    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  // =========================
  // 🔥 LOAD DATA
  // =========================
  const loadData = async (u: any) => {

    // 🛒 BUY NOW
    const buyNow = localStorage.getItem("buy-now");

    if (buyNow) {
      const parsed = JSON.parse(buyNow);

      if (!parsed?.price) {
        router.replace("/");
        return;
      }

      setItems([{
        ...parsed,
        qty: Number(parsed.quantity) || 1,
        price: Number(parsed.price) || 0,
        image: parsed.image || "/no-image.png"
      }]);

    } else {
      // 🔥 FIRESTORE CART
      const snap = await getDocs(
        collection(db, "carts", u.uid, "items")
      );

      const cartItems = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        qty: d.data().quantity || 1
      }));

      if (cartItems.length === 0) {
        router.replace("/");
        return;
      }

      setItems(cartItems);
    }

    // 📍 ADDRESS
    const addrSnap = await getDocs(
      collection(db, "users", u.uid, "addresses")
    );

    let all: any[] = [];
    let defaultAddr: any = null;

    addrSnap.forEach(d => {
      const data = { id: d.id, ...d.data() };
      all.push(data);
      if (data.isDefault) defaultAddr = data;
    });

    setAddresses(all);
    setAddress(defaultAddr || all[0] || null);

    // 🚚 SHIPPING
    const shipSnap = await getDoc(doc(db, "config", "shipping"));

    if (shipSnap.exists()) {
      const data = shipSnap.data();

      setShippingConfig({
        prepaid: Number(data.prepaid) || 0,
        cod: Number(data.cod) || 0,
        freeShippingAbove: Number(data.freeShippingAbove) || 0
      });
    }

    setLoading(false);
  };

  // =========================
  // 🔥 INIT
  // =========================
  useEffect(() => {

    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) return router.push("/login");

      setUser(u);
      await loadData(u);

    });

    return () => unsub();

  }, []);

  // =========================
  // 💰 TOTAL
  // =========================
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

  // =========================
  // 🚀 PAYMENT
  // =========================
  const handlePayment = async () => {

    if (!address) return alert("Add address ❌");

    try {
      const res = await fetch("/api/cashfree/create-order", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
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

      const cashfree = await load({ mode: "production" });

      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
      });

    } catch {
      alert("Payment failed");
    }
  };

  // =========================
  // ⏳ LOADING FIX
  // =========================
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Loading Checkout...
      </div>
    );
  }

  // =========================
  // 🎨 UI
  // =========================
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4 pb-32 text-white">

      <h1 className="text-3xl text-center mb-6">Checkout 🛍</h1>

      {/* ADDRESS */}
      <div className="bg-white/20 p-4 rounded-2xl mb-4">

        <div className="flex justify-between mb-2">
          <p>Delivery Address</p>
          <button onClick={() => router.push("/account")}>
            Change
          </button>
        </div>

        {address && (
          <div>
            <p>{address.name}</p>
            <p>{address.phone}</p>
            <p>{address.address}</p>
          </div>
        )}

      </div>

      {/* SUMMARY */}
      <div className="bg-white/20 p-4 rounded mb-4">
        <p>Items: ₹{itemsTotal}</p>
        <p>Shipping: ₹{shipping}</p>
        <p>Total: ₹{total}</p>
      </div>

      {/* BUTTON */}
      <button
        onClick={handlePayment}
        className="fixed bottom-5 left-4 right-4 bg-black py-4 rounded-xl"
      >
        Pay ₹{total}
      </button>

    </div>
  );
}

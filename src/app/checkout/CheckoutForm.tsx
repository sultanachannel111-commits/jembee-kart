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

  const [hidePage, setHidePage] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<any[]>([]);
  const [refSeller, setRefSeller] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState("ONLINE");

  const [shippingConfig, setShippingConfig] = useState({
    prepaid: 0,
    cod: 0,
    freeShippingAbove: 0
  });

  const router = useRouter();

  // =========================
  // 🔥 BACK FIX
  // =========================
  useEffect(() => {
    const handleBack = () => {
      console.log("🔥 BACK BUTTON TRIGGERED");
      setHidePage(true);
      router.replace("/");
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, []);

  if (hidePage) return null;

  // =========================
  // 🔥 LOAD DATA
  // =========================
  const loadData = async (u: any) => {

    console.log("======== LOAD DATA START ========");

    const buyNow = localStorage.getItem("buy-now");
    const cart = localStorage.getItem("cart");

    console.log("BUY-NOW:", buyNow);
    console.log("CART:", cart);

    // 🛒 ITEMS
    if (buyNow) {
      const parsed = JSON.parse(buyNow);

      const item = {
        ...parsed,
        qty: Number(parsed.quantity) || 1,
        price: Number(parsed.price) || 0,
        basePrice: Number(parsed.basePrice || parsed.price) || 0,
        image: parsed.image || "/no-image.png"
      };

      console.log("🔥 BUY NOW ITEM:", item);

      setItems([item]);

    } else if (cart) {

      const parsedCart = JSON.parse(cart);

      console.log("🔥 CART ITEMS:", parsedCart);

      setItems(Array.isArray(parsedCart) ? parsedCart : []);

    } else {
      console.log("❌ NO ITEMS FOUND");
      setItems([]);
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

    console.log("🔥 ADDRESSES:", all);

    setAddresses(all);

    // ✅ FIXED (NO BUG)
    const selected = defaultAddr || all[0] || null;

    console.log("🔥 SELECTED ADDRESS:", selected);

    setAddress(selected);

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

    console.log("======== LOAD DATA END ========");
  };

  // =========================
  // 🔥 INIT
  // =========================
  useEffect(() => {

    const seller = localStorage.getItem("refSeller");
    setRefSeller(seller);

    const unsub = onAuthStateChanged(auth, async (u) => {

      console.log("🔥 USER:", u);

      if (!u) return router.push("/login");

      setUser(u);
      await loadData(u);

    });

    return () => unsub();

  }, []);

  // =========================
  // 🔥 REFRESH FIX
  // =========================
  useEffect(() => {

    const handleFocus = () => {
      console.log("🔥 WINDOW FOCUS → RELOAD");
      if (auth.currentUser) {
        loadData(auth.currentUser);
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };

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

  console.log("💰 TOTAL:", total);

  // =========================
  // 🚀 PAYMENT
  // =========================
  const handlePayment = async () => {

    console.log("🔥 PAYMENT START");

    if (!address) return alert("Add address ❌");
    if (items.length === 0) return alert("Cart empty ❌");

    try {
      setLoading(true);

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

      console.log("🔥 PAYMENT RESPONSE:", data);

      const cashfree = await load({ mode: "production" });

      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
      });

    } catch (err) {
      console.log("❌ PAYMENT ERROR:", err);
      alert("Payment error ❌");
    }

    setLoading(false);
  };

  // =========================
  // 🎨 UI
  // =========================
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4 pb-32 text-white">

      <h1 className="text-3xl font-bold text-center mb-6">
        Checkout 🛍
      </h1>

      {/* ADDRESS */}
      <div className="bg-white/20 p-4 rounded-2xl mb-4">

        <div className="flex justify-between mb-2">
          <p>Delivery Address</p>

          <button
            onClick={() => router.push("/account")}
            className="underline"
          >
            Change Address
          </button>
        </div>

        {address ? (
          <div>
            <p>{address.name}</p>
            <p>{address.phone}</p>
            <p>{address.address}</p>
          </div>
        ) : (
          <p>No address ❌</p>
        )}

      </div>

      {/* TOTAL */}
      <div className="bg-white/20 p-4 rounded mb-4">
        Total ₹{total}
      </div>

      <button
        onClick={handlePayment}
        className="fixed bottom-5 left-4 right-4 bg-black py-4 rounded-xl"
      >
        Pay ₹{total}
      </button>

    </div>
  );
}

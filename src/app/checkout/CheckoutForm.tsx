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
  // 🔥 LOAD DATA (FIXED)
  // =========================
  const loadData = async (u: any) => {

    console.log("🔥 LOAD START");

    const buyNow = localStorage.getItem("buy-now");
    const cart = localStorage.getItem("cart");

    // =====================
    // ✅ ITEMS FIX (MAIN BUG FIX)
    // =====================
    try {

      if (buyNow) {
        const parsed = JSON.parse(buyNow);

        const item = {
          ...parsed,
          qty: Number(parsed.quantity) || 1,
          price: Number(parsed.price) || 0,
          basePrice: Number(parsed.basePrice || parsed.price) || 0,
          image: parsed.image || "/no-image.png"
        };

        console.log("✅ BUY NOW ITEM:", item);
        setItems([item]);

      } else if (cart) {

        const parsedCart = JSON.parse(cart);

        const clean = Array.isArray(parsedCart)
          ? parsedCart.map((i: any) => ({
              ...i,
              price: Number(i.price) || 0,
              qty: Number(i.qty || i.quantity) || 1,
              image: i.image || "/no-image.png"
            }))
          : [];

        console.log("✅ CART ITEMS:", clean);

        setItems(clean);

      } else {
        console.log("❌ NO CART FOUND");
        setItems([]);
      }

    } catch (err) {
      console.log("❌ CART PARSE ERROR:", err);
      setItems([]);
    }

    // =====================
    // 📍 ADDRESS
    // =====================
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

    console.log("📍 ADDRESSES:", all);

    setAddresses(all);

    setAddress(prev => {
      if (prev && all.find(a => a.id === prev.id)) return prev;
      return defaultAddr || all[0] || null;
    });

    // =====================
    // 🚚 SHIPPING
    // =====================
    const shipSnap = await getDoc(doc(db, "config", "shipping"));

    if (shipSnap.exists()) {
      const data = shipSnap.data();

      setShippingConfig({
        prepaid: Number(data.prepaid) || 0,
        cod: Number(data.cod) || 0,
        freeShippingAbove: Number(data.freeShippingAbove) || 0
      });
    }

    console.log("🔥 LOAD END");
  };

  // =========================
  // INIT
  // =========================
  useEffect(() => {

    const seller = localStorage.getItem("refSeller");
    setRefSeller(seller);

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.push("/login");
      setUser(u);
      await loadData(u);
    });

    return () => unsub();

  }, []);

  // =========================
  // BACK FIX
  // =========================
  useEffect(() => {
    const handleFocus = () => {
      if (auth.currentUser) {
        console.log("🔄 REFRESH");
        loadData(auth.currentUser);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // =========================
  // 💰 TOTAL FIXED
  // =========================
  const itemsTotal = items.reduce((sum, i) => {
    return sum + (Number(i.price) || 0) * (Number(i.qty) || 1);
  }, 0);

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
  // 🚀 PAYMENT (DEBUG SAFE)
  // =========================
  const handlePayment = async () => {

    console.log("🔥 PAYMENT CLICK");

    if (!address) return alert("Add address ❌");
    if (items.length === 0) return alert("Cart empty ❌");

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

      console.log("📦 ORDER DATA:", orderData);

      // COD
      if (paymentMethod === "COD") {

        const res = await fetch("/api/orders/cod", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData)
        });

        const data = await res.json();

        console.log("✅ COD RESPONSE:", data);

        if (!data.success) return alert("Order failed ❌");

        localStorage.removeItem("buy-now");
        localStorage.removeItem("cart");

        router.replace(`/order-success/${data.orderId}`);
        return;
      }

      // ONLINE
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

      console.log("💳 PAYMENT RESPONSE:", data);

      if (!data.payment_session_id) {
        alert("Payment error ❌");
        return;
      }

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
  // UI (UNCHANGED)
  // =========================
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-orange-400 p-4 pb-32 text-white">

      <h1 className="text-3xl font-bold text-center mb-6">
        Checkout 🛍
      </h1>

      <div className="bg-white/20 backdrop-blur-xl p-5 rounded-3xl shadow-xl mb-4">

        <div className="flex justify-between items-center mb-3">
          <p className="font-semibold text-lg">Delivery Address 📍</p>

          <button
            onClick={() => router.push("/account")}
            className="text-sm text-blue-300 underline"
          >
            Change
          </button>
        </div>

        {address ? (
          <div className="text-sm space-y-1">
            <p className="font-bold">{address.name}</p>
            <p>{address.phone}</p>
            <p>{address.address}</p>
            <p>{address.city}, {address.state}</p>
          </div>
        ) : (
          <p>No address ❌</p>
        )}

        <div className="flex gap-3 mt-4 overflow-x-auto">
          {addresses.map((a) => (
            <div
              key={a.id}
              onClick={() => setAddress(a)}
              className={`p-3 min-w-[160px] rounded-2xl cursor-pointer ${
                address?.id === a.id
                  ? "bg-green-500 scale-105"
                  : "bg-white/20"
              }`}
            >
              <p className="text-xs font-bold">{a.name}</p>
              <p className="text-xs">{a.city}</p>
            </div>
          ))}
        </div>

      </div>

      <div className="bg-white/20 backdrop-blur-xl p-5 rounded-3xl shadow-xl mb-4">
        <p className="flex justify-between">
          <span>Items</span>
          <span>₹{itemsTotal}</span>
        </p>

        <p className="flex justify-between">
          <span>Shipping</span>
          <span>₹{shipping}</span>
        </p>

        <hr className="my-3 border-white/30"/>

        <p className="flex justify-between text-xl font-bold">
          <span>Total</span>
          <span>₹{total}</span>
        </p>
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/20 backdrop-blur-xl">
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-700 to-pink-600 font-bold text-lg shadow-lg"
        >
          {loading ? "Processing..." : `Pay ₹${total}`}
        </button>
      </div>

    </div>
  );
}

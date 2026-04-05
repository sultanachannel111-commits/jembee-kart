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
  // 🔥 LOAD DATA
  // =========================
  const loadData = async (u: any) => {

    const buyNow = localStorage.getItem("buy-now");
    const cart = localStorage.getItem("cart");

    if (buyNow) {
      const parsed = JSON.parse(buyNow);

      setItems([{
        ...parsed,
        qty: Number(parsed.quantity) || 1,
        price: Number(parsed.price) || 0,
        basePrice: Number(parsed.basePrice || parsed.price) || 0,
        image: parsed.image || "/no-image.png"
      }]);

    } else if (cart) {
      const parsedCart = JSON.parse(cart);
      setItems(Array.isArray(parsedCart) ? parsedCart : []);
    } else {
      setItems([]);
    }

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

    setAddress(prev => {
      if (prev && all.find(a => a.id === prev.id)) return prev;
      return defaultAddr || all[0] || null;
    });

    const shipSnap = await getDoc(doc(db, "config", "shipping"));

    if (shipSnap.exists()) {
      const data = shipSnap.data();

      setShippingConfig({
        prepaid: Number(data.prepaid) || 0,
        cod: Number(data.cod) || 0,
        freeShippingAbove: Number(data.freeShippingAbove) || 0
      });
    }
  };

  // INIT
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

  // BACK FIX
  useEffect(() => {
    const handleFocus = () => {
      if (auth.currentUser) loadData(auth.currentUser);
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // TOTAL
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

  // PAYMENT
  const handlePayment = async () => {

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

      // COD
      if (paymentMethod === "COD") {
        const res = await fetch("/api/orders/cod", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData)
        });

        const data = await res.json();

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

      const cashfree = await load({ mode: "production" });

      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
      });

    } catch {
      alert("Payment error ❌");
    }

    setLoading(false);
  };

  // =========================
  // 🎨 UI (PREMIUM)
  // =========================
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-orange-400 p-4 pb-32 text-white">

      <h1 className="text-3xl font-bold text-center mb-6">
        Checkout 🛍
      </h1>

      {/* ADDRESS */}
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

        {/* SELECT */}
        <div className="flex gap-3 mt-4 overflow-x-auto">
          {addresses.map((a) => (
            <div
              key={a.id}
              onClick={() => setAddress(a)}
              className={`p-3 min-w-[160px] rounded-2xl cursor-pointer transition ${
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

      {/* PAYMENT */}
      <div className="bg-white/20 backdrop-blur-xl p-5 rounded-3xl shadow-xl mb-4">

        <p className="font-semibold mb-3">Select Payment</p>

        <div className="flex gap-3">
          <button
            onClick={() => setPaymentMethod("ONLINE")}
            className={`flex-1 p-3 rounded-xl ${
              paymentMethod === "ONLINE"
                ? "bg-green-500"
                : "bg-white/20"
            }`}
          >
            Online 💳
          </button>

          <button
            onClick={() => setPaymentMethod("COD")}
            className={`flex-1 p-3 rounded-xl ${
              paymentMethod === "COD"
                ? "bg-yellow-500"
                : "bg-white/20"
            }`}
          >
            COD 🚚
          </button>
        </div>

      </div>

      {/* SUMMARY */}
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

      {/* ITEMS */}
      {items.map((item, i) => (
        <div key={i} className="bg-white/20 backdrop-blur-xl p-3 rounded-2xl mb-3 flex gap-3 shadow">

          <img src={item.image} className="w-16 h-16 rounded-xl object-cover"/>

          <div>
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm">Qty: {item.qty}</p>
            <p className="font-bold text-green-300">₹{item.price}</p>
          </div>

        </div>
      ))}

      {/* BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/20 backdrop-blur-xl">

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-700 to-pink-600 font-bold text-lg shadow-lg"
        >
          {loading
            ? "Processing..."
            : paymentMethod === "COD"
            ? `Place Order ₹${total}`
            : `Pay ₹${total}`}
        </button>

      </div>

    </div>
  );
}

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
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState([]);
  const [refSeller, setRefSeller] = useState(null);

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
  const loadData = async (u) => {

    // 🛒 ITEMS LOAD
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

    // 📍 ADDRESS LOAD
    const addrSnap = await getDocs(
      collection(db, "users", u.uid, "addresses")
    );

    let all = [];
    let defaultAddr = null;

    addrSnap.forEach(d => {
      const data = { id: d.id, ...d.data() };
      all.push(data);

      if (data.isDefault) defaultAddr = data;
    });

    setAddresses(all);

    // ✅ PRESERVE SELECTED ADDRESS
    setAddress(prev => {
      if (prev) return prev;
      return defaultAddr || all[0] || null;
    });

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
  };

  // =========================
  // 🔥 INIT
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
  // 🔥 BACK FIX (FOCUS)
  // =========================
  useEffect(() => {

    const handleFocus = () => {
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

  // =========================
  // 🚀 PAYMENT
  // =========================
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

      // 🟡 COD
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

        router.push(`/order-success/${data.orderId}`);
        return;
      }

      // 🔵 ONLINE
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

      if (!data.payment_session_id) {
        alert("Payment error ❌");
        return;
      }

      const cashfree = await load({ mode: "production" });

      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
      });

      localStorage.removeItem("buy-now");
      localStorage.removeItem("cart");

    } catch {
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
      <div className="bg-white/20 backdrop-blur-xl p-4 rounded-2xl mb-4">

        <div className="flex justify-between mb-2">
          <p className="font-semibold">Delivery Address 📍</p>

          <button
            onClick={() => router.push("/account")}
            className="text-blue-300 underline"
          >
            Change Address
          </button>
        </div>

        {address ? (
          <div className="text-sm">
            <p className="font-semibold">{address.name}</p>
            <p>{address.phone}</p>
            <p>{address.address || address.addressLine}</p>
            <p>{address.city}, {address.state}</p>
            <p>PIN: {address.pincode}</p>
          </div>
        ) : (
          <p>No address found ❌</p>
        )}

        {/* SELECT ADDRESS */}
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {addresses.map((a) => (
            <div
              key={a.id}
              onClick={() => setAddress(a)}
              className={`p-2 min-w-[150px] rounded-xl cursor-pointer ${
                address?.id === a.id
                  ? "bg-green-500"
                  : "bg-white/20"
              }`}
            >
              <p className="text-xs font-semibold">{a.name}</p>
              <p className="text-xs">{a.city}</p>
            </div>
          ))}
        </div>

      </div>

      {/* PAYMENT */}
      <div className="bg-white/20 p-4 rounded-2xl mb-4">

        <p className="font-semibold mb-2">Select Payment</p>

        <div className="flex gap-3">
          <button
            onClick={() => setPaymentMethod("ONLINE")}
            className={`flex-1 p-2 rounded ${
              paymentMethod === "ONLINE"
                ? "bg-green-500"
                : "bg-white/20"
            }`}
          >
            Online 💳
          </button>

          <button
            onClick={() => setPaymentMethod("COD")}
            className={`flex-1 p-2 rounded ${
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
      <div className="bg-white/20 p-4 rounded-2xl mb-4">
        <p>Items: ₹{itemsTotal}</p>
        <p>Shipping: ₹{shipping}</p>
        <hr className="my-2 border-white/30"/>
        <p className="text-xl font-bold">Total: ₹{total}</p>
      </div>

      {/* ITEMS */}
      {items.map((item, i) => (
        <div key={i} className="bg-white/20 p-3 rounded mb-3 flex gap-3">
          <img src={item.image} className="w-16 h-16 rounded"/>
          <div>
            <p>{item.name}</p>
            <p>Qty: {item.qty}</p>
            <p>₹{item.price}</p>
          </div>
        </div>
      ))}

      {/* BUTTON */}
      <button
        onClick={handlePayment}
        disabled={loading}
        className="fixed bottom-5 left-4 right-4 bg-black text-white py-4 rounded-xl font-bold"
      >
        {loading
          ? "Processing..."
          : paymentMethod === "COD"
          ? `Place Order ₹${total}`
          : `Pay ₹${total}`}
      </button>

    </div>
  );
}

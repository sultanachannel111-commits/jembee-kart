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
  useEffect(() => {

    const seller = localStorage.getItem("refSeller");
    setRefSeller(seller);

    // ✅ FIX: buy-now reload safe
    const buyNow = localStorage.getItem("buy-now");

    if (buyNow) {
      const parsed = JSON.parse(buyNow);

      if (parsed && parsed.price) {
        setItems([{
          ...parsed,
          qty: Number(parsed.quantity) || 1,
          price: Number(parsed.price) || 0,
          basePrice: Number(parsed.basePrice || parsed.price) || 0,
          image: parsed.image || "/no-image.png"
        }]);
      }
    }

    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) return router.push("/login");

      setUser(u);

      // ✅ LOAD ADDRESS
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
      setAddress(defaultAddr || all[0]);

      // ✅ SHIPPING CONFIG
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

  // =========================
  // 💰 TOTAL FIX
  // =========================

  const itemsTotal = items.length > 0
    ? items.reduce((sum, i) => sum + (i.price * i.qty), 0)
    : 0;

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
  // 💰 PROFIT + COMMISSION
  // =========================

  const totalProfit = items.reduce((sum, item) => {
    return sum + (item.price - item.basePrice) * item.qty;
  }, 0);

  const commission = refSeller
    ? Math.floor(totalProfit * 0.5)
    : 0;

  // =========================
  // 🚀 PAYMENT
  // =========================

  const handlePayment = async () => {

    if (!address) {
      alert("Add address ❌");
      return;
    }

    // ✅ FIX: empty cart block
    if (items.length === 0) {
      alert("Cart empty ❌");
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        userId: user.uid,
        items,
        itemsTotal,
        shipping,
        total,
        address,
        sellerRef: refSeller || null,
        commission
      };

      // 🟡 COD
      if (paymentMethod === "COD") {

        const res = await fetch("/api/orders/cod", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(orderData)
        });

        const data = await res.json();

        if (!data.success) {
          alert("Order failed ❌");
          return;
        }

        localStorage.removeItem("buy-now");

        router.push(`/order-success/${data.orderId}`);
        return;
      }

      // 🔵 ONLINE
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
        mode: "production" // ✅ FIX: always real payment
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
            className="text-xs bg-white/20 px-2 py-1 rounded"
          >
            Change
          </button>
        </div>

        {address ? (
          <div className="text-sm">
            <p className="font-semibold">{address.name}</p>
            <p>{address.phone}</p>
            <p>
              {address.addressLine}, {address.city}, {address.state} - {address.pincode}
            </p>
          </div>
        ) : (
          <p className="text-red-300">No address found ❌</p>
        )}

      </div>

      {/* PAYMENT */}
      <div className="bg-white/20 backdrop-blur-xl p-4 rounded-2xl mb-4">

        <p className="mb-2 font-semibold">Select Payment</p>

        <div className="flex gap-3">

          <button
            onClick={() => setPaymentMethod("ONLINE")}
            className={`flex-1 p-2 rounded-xl ${
              paymentMethod === "ONLINE"
                ? "bg-green-500"
                : "bg-white/20"
            }`}
          >
            Online 💳
          </button>

          <button
            onClick={() => setPaymentMethod("COD")}
            className={`flex-1 p-2 rounded-xl ${
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
      <div className="bg-white/20 backdrop-blur-xl p-4 rounded-2xl mb-4">

        <p>Items: ₹{itemsTotal}</p>
        <p>Shipping: ₹{shipping}</p>

        <hr className="my-2 border-white/30"/>

        <p className="text-xl font-bold">Total: ₹{total}</p>

      </div>

      {/* ITEMS */}
      {items.map((item, i) => (
        <div key={i} className="bg-white/20 backdrop-blur-xl p-3 rounded-xl mb-3 flex gap-3">

          <img src={item.image} className="w-16 h-16 rounded"/>

          <div>
            <p>{item.name}</p>
            <p>Qty: {item.qty}</p>
            <p>₹{item.price}</p>
          </div>

        </div>
      ))}

      {/* BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-3 bg-white/20 backdrop-blur-xl">

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-700 to-pink-600 font-bold"
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

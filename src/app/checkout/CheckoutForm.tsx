"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  onSnapshot
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { load } from "@cashfreepayments/cashfree-js";

export default function CheckoutPage() {

  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("ONLINE");

  const [shippingConfig, setShippingConfig] = useState({
    prepaid: 0,
    cod: 0,
    freeShippingAbove: 0
  });

  const router = useRouter();

  // =========================
  // 🔥 LOAD DATA (BUY NOW + CART)
  // =========================
  useEffect(() => {

    let unsubscribe: any;

    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) return router.push("/login");

      setUser(u);

      // =====================
      // 🟢 BUY NOW (PRIORITY)
      // =====================
      const buyNow = localStorage.getItem("buy-now");

      if (buyNow) {
        try {
          const parsed = JSON.parse(buyNow);

          if (parsed && parsed.price > 0) {

            const item = {
              id: "buy-now",
              productId: parsed.productId,
              name: parsed.name,
              image: parsed.image || "/no-image.png",
              price: Number(parsed.price) || 0,
              qty: Number(parsed.quantity) || 1
            };

            console.log("🔥 BUY NOW:", item);

            setItems([item]);

          } else {
            setItems([]);
          }

        } catch {
          setItems([]);
        }

      } else {

        // =====================
        // 🛒 FIRESTORE CART
        // =====================
        const ref = collection(db, "carts", u.uid, "items");

        unsubscribe = onSnapshot(ref, (snap) => {

          const data: any[] = [];

          snap.forEach(docSnap => {

            const d: any = docSnap.data();

            const price =
              d?.variations?.[0]?.sizes?.[0]?.sellPrice ||
              d.price ||
              0;

            data.push({
              id: docSnap.id,
              productId: d.productId,
              name: d.name,
              image: d.image || "/no-image.png",
              price: Number(price) || 0,
              qty: Number(d.quantity) || 1
            });

          });

          setItems(data);

        });

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

      setAddresses(all);
      setAddress(defaultAddr || all[0] || null);

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

    });

    return () => {
      unsub();
      if (unsubscribe) unsubscribe();
    };

  }, []);

  // =========================
  // 💰 TOTAL FIX
  // =========================
  const itemsTotal = items.reduce((sum, i) => {
    return sum + (Number(i.price) || 0) * (Number(i.qty) || 1);
  }, 0);

  let shipping =
    items.length === 0
      ? 0
      : paymentMethod === "COD"
      ? shippingConfig.cod
      : shippingConfig.prepaid;

  if (
    shippingConfig.freeShippingAbove > 0 &&
    itemsTotal >= shippingConfig.freeShippingAbove
  ) {
    shipping = 0;
  }

  const total = items.length === 0 ? 0 : itemsTotal + shipping;

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
        address
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

        localStorage.removeItem("buy-now"); // 🔥 clear

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

      localStorage.removeItem("buy-now");

    } catch (err) {
      console.log(err);
      alert("Payment error ❌");
    }

    setLoading(false);
  };

  // =========================
  // 🎨 PREMIUM UI
  // =========================
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-orange-400 p-4 pb-32 text-white">

      <h1 className="text-3xl font-bold text-center mb-6">
        Checkout 🛍
      </h1>

      {/* ADDRESS */}
      <div className="bg-white/20 backdrop-blur-xl p-5 rounded-3xl shadow-xl mb-4">
        <div className="flex justify-between mb-3">
          <p className="font-semibold text-lg">Delivery Address 📍</p>
          <button
            onClick={() => router.push("/account")}
            className="underline text-sm"
          >
            Change
          </button>
        </div>

        {address ? (
          <div className="text-sm space-y-1">
            <p className="font-bold">{address.name}</p>
            <p>{address.phone}</p>
            <p>{address.address}</p>
          </div>
        ) : (
          <p>No address ❌</p>
        )}
      </div>

      {/* PAYMENT */}
      <div className="bg-white/20 backdrop-blur-xl p-4 rounded-3xl mb-4">
        <p className="mb-2 font-semibold">Payment Method</p>

        <div className="flex gap-3">
          <button
            onClick={() => setPaymentMethod("ONLINE")}
            className={`flex-1 py-2 rounded-xl ${
              paymentMethod === "ONLINE"
                ? "bg-green-500"
                : "bg-white/20"
            }`}
          >
            Online 💳
          </button>

          <button
            onClick={() => setPaymentMethod("COD")}
            className={`flex-1 py-2 rounded-xl ${
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
      <div className="bg-white/20 backdrop-blur-xl p-5 rounded-3xl mb-4">
        <p className="flex justify-between">
          <span>Items</span>
          <span>₹{itemsTotal}</span>
        </p>

        <p className="flex justify-between">
          <span>Shipping</span>
          <span>₹{shipping}</span>
        </p>

        <hr className="my-2 border-white/30"/>

        <p className="flex justify-between text-xl font-bold">
          <span>Total</span>
          <span>₹{total}</span>
        </p>
      </div>

      {/* ITEMS */}
      {items.map((item) => (
        <div key={item.id} className="bg-white/20 backdrop-blur-xl p-3 rounded-2xl mb-3 flex gap-3">

          <img src={item.image} className="w-16 h-16 rounded-xl object-cover"/>

          <div>
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm">Qty: {item.qty}</p>
            <p className="text-green-300 font-bold">₹{item.price}</p>
          </div>

        </div>
      ))}

      {/* BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/20 backdrop-blur-xl">
        <button
          onClick={handlePayment}
          disabled={loading || items.length === 0}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-700 to-pink-600 font-bold text-lg shadow-lg"
        >
          {loading ? "Processing..." : `Pay ₹${total}`}
        </button>
      </div>

    </div>
  );
}

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
  // 🔥 AUTH + LOAD
  // =========================
  useEffect(() => {

    let unsubscribe: any;

    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) return router.push("/login");

      setUser(u);

      // =====================
      // 🛒 LIVE CART (Firestore)
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

        console.log("🔥 FIRESTORE CART:", data);

        setItems(data);

      });

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
  // 💰 TOTAL
  // =========================
  const itemsTotal = items.reduce((sum, i) => {
    return sum + i.price * i.qty;
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

      console.log("📦 ORDER:", orderData);

      // COD
      if (paymentMethod === "COD") {

        const res = await fetch("/api/orders/cod", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData)
        });

        const data = await res.json();

        if (!data.success) return alert("Order failed ❌");

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

    } catch (err) {
      console.log(err);
      alert("Payment error ❌");
    }

    setLoading(false);
  };

  // =========================
  // 🎨 UI
  // =========================
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-orange-400 p-4 pb-32 text-white">

      <h1 className="text-3xl font-bold text-center mb-6">
        Checkout 🛍
      </h1>

      {/* ADDRESS */}
      <div className="bg-white/20 backdrop-blur-xl p-5 rounded-3xl mb-4">

        <div className="flex justify-between mb-3">
          <p className="font-semibold">Delivery Address 📍</p>

          <button onClick={() => router.push("/account")}>
            Change
          </button>
        </div>

        {address && (
          <div className="text-sm">
            <p className="font-bold">{address.name}</p>
            <p>{address.phone}</p>
            <p>{address.address}</p>
          </div>
        )}

      </div>

      {/* PAYMENT */}
      <div className="bg-white/20 p-4 rounded-2xl mb-4">
        <div className="flex gap-3">
          <button onClick={() => setPaymentMethod("ONLINE")}>
            Online 💳
          </button>
          <button onClick={() => setPaymentMethod("COD")}>
            COD 🚚
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="bg-white/20 p-4 rounded-2xl mb-4">
        <p>Items: ₹{itemsTotal}</p>
        <p>Shipping: ₹{shipping}</p>
        <p className="text-xl font-bold">Total: ₹{total}</p>
      </div>

      {/* ITEMS */}
      {items.map((item) => (
        <div key={item.id} className="bg-white/20 p-3 rounded mb-2 flex gap-3">

          <img src={item.image} className="w-16 h-16 rounded"/>

          <div>
            <p>{item.name}</p>
            <p>Qty: {item.qty}</p>
            <p>₹{item.price}</p>
          </div>

        </div>
      ))}

      {/* BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-4">
        <button
          onClick={handlePayment}
          className="w-full py-4 bg-black rounded-xl"
        >
          {loading ? "Processing..." : `Pay ₹${total}`}
        </button>
      </div>

    </div>
  );
}

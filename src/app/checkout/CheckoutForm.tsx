"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  deleteDoc
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
  const [processing, setProcessing] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("ONLINE");
  const [refSeller, setRefSeller] = useState<string | null>(null);

  const [shippingConfig, setShippingConfig] = useState({
    prepaid: 0,
    cod: 0,
    freeShippingAbove: 0
  });

  const router = useRouter();

  // ================= LOAD =================
  useEffect(() => {

    let unsubscribe: any;

    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) return router.push("/login");

      setUser(u);
      setRefSeller(localStorage.getItem("refSeller"));

      const buyNow = localStorage.getItem("buy-now");

      // ✅ BUY NOW
      if (buyNow) {
        try {
          const parsed = JSON.parse(buyNow);

          setItems([{
            id: "buy-now",
            productId: parsed.productId,
            name: parsed.name,
            image: parsed.image || "/no-image.png",
            price: Number(parsed.price) || 0,
            basePrice: Number(parsed.basePrice || parsed.price) || 0,
            qty: Number(parsed.quantity) || 1
          }]);

        } catch {
          setItems([]);
        }

      } else {

        // ✅ FIRESTORE CART
        const ref = collection(db, "carts", u.uid, "items");

        unsubscribe = onSnapshot(ref, (snap) => {

          const data: any[] = [];

          snap.forEach(docSnap => {

            const d: any = docSnap.data();

            const price =
              d?.variations?.[0]?.sizes?.[0]?.sellPrice ||
              d.price || 0;

            const basePrice =
              d?.variations?.[0]?.sizes?.[0]?.basePrice ||
              d.basePrice || price;

            data.push({
              id: docSnap.id,
              productId: d.productId,
              name: d.name,
              image: d.image || "/no-image.png",
              price: Number(price),
              basePrice: Number(basePrice),
              qty: Number(d.quantity) || 1
            });

          });

          setItems(data);
        });
      }

      // ✅ ADDRESS
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

      // ✅ SHIPPING
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

  // ================= TOTAL =================
  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

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

  // ================= CLEAR CART =================
  const clearCart = async () => {
    if (!user) return;

    const ref = collection(db, "carts", user.uid, "items");
    const snap = await getDocs(ref);

    snap.forEach(async (d) => {
      await deleteDoc(doc(db, "carts", user.uid, "items", d.id));
    });
  };

  // ================= PAYMENT =================
  const handlePayment = async () => {

    if (processing) return;
    setProcessing(true);

    if (!address) {
      router.push("/account");
      return;
    }

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

        await clearCart();
        localStorage.removeItem("buy-now");

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

      if (!data.payment_session_id) {
        alert("Payment failed ❌");
        return;
      }

      const cashfree = await load({ mode: "production" });

      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
      });

      await clearCart();
      localStorage.removeItem("buy-now");

    } catch (err) {
      console.log(err);
      alert("Payment error ❌");
    }

    setLoading(false);
    setProcessing(false);
  };

  // ================= EMPTY =================
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Cart is empty ❌
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 via-pink-600 to-orange-400 p-4 pb-36 text-white">

      <h1 className="text-3xl font-extrabold text-center mb-6">
        Checkout 🛍
      </h1>

      {/* ADDRESS */}
      <div className="bg-white/20 backdrop-blur-3xl p-5 rounded-3xl shadow-xl border border-white/30 mb-4">
        <div className="flex justify-between mb-3">
          <p className="font-semibold text-lg">Delivery Address 📍</p>
          <button onClick={() => router.push("/account")} className="underline text-sm">
            Change
          </button>
        </div>

        <p className="font-bold">{address?.name}</p>
        <p>{address?.phone}</p>
        <p>{address?.address}</p>
      </div>

      {/* PAYMENT */}
      <div className="bg-white/20 backdrop-blur-3xl p-4 rounded-3xl mb-4">
        <div className="flex gap-3">
          <button
            onClick={() => setPaymentMethod("ONLINE")}
            className={`flex-1 py-3 rounded-xl ${
              paymentMethod === "ONLINE" ? "bg-green-500" : "bg-white/20"
            }`}
          >
            Online 💳
          </button>

          <button
            onClick={() => setPaymentMethod("COD")}
            className={`flex-1 py-3 rounded-xl ${
              paymentMethod === "COD" ? "bg-yellow-500" : "bg-white/20"
            }`}
          >
            COD 🚚
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="bg-white/20 backdrop-blur-3xl p-5 rounded-3xl mb-4">
        <p className="flex justify-between">
          <span>Items</span>
          <span>₹{itemsTotal}</span>
        </p>

        <p className="flex justify-between">
          <span>Shipping</span>
          <span>₹{shipping}</span>
        </p>

        <hr className="my-2 border-white/30" />

        <p className="flex justify-between text-xl font-bold">
          <span>Total</span>
          <span>₹{total}</span>
        </p>
      </div>

      {/* BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/20 backdrop-blur-xl">
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-purple-700 to-pink-600 rounded-xl font-bold"
        >
          {loading ? "Processing..." : `Pay ₹${total}`}
        </button>
      </div>

    </div>
  );
}

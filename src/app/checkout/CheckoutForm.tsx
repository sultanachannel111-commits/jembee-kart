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

    console.log("🔥 LOAD START");

    const buyNow = localStorage.getItem("buy-now");
    const cart = localStorage.getItem("cart");

    // ITEMS
    if (buyNow) {
      const parsed = JSON.parse(buyNow);

      const item = {
        ...parsed,
        qty: Number(parsed.quantity) || 1,
        price: Number(parsed.price) || 0,
        basePrice: Number(parsed.basePrice || parsed.price) || 0,
        image: parsed.image || "/no-image.png"
      };

      console.log("✅ BUY NOW:", item);
      setItems([item]);

    } else if (cart) {

      const parsedCart = JSON.parse(cart);
      console.log("✅ CART:", parsedCart);

      setItems(Array.isArray(parsedCart) ? parsedCart : []);

    } else {
      console.log("❌ EMPTY CART");
      setItems([]);
    }

    // ADDRESS
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

    // FIXED
    setAddress(prev => {
      if (prev && all.find(a => a.id === prev.id)) {
        return prev;
      }
      return defaultAddr || all[0] || null;
    });

    // SHIPPING
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
  // 🔥 BACK FIX (RELOAD)
  // =========================
  useEffect(() => {

    const handleFocus = () => {
      if (auth.currentUser) {
        console.log("🔄 REFRESH");
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

      // 🟡 COD
      if (paymentMethod === "COD") {

        console.log("🚚 COD ORDER:", orderData);

        const res = await fetch("/api/orders/cod", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData)
        });

        const data = await res.json();

        console.log("✅ COD RESPONSE:", data);

        if (!data.success) {
          alert("Order failed ❌");
          return;
        }

        localStorage.removeItem("buy-now");
        localStorage.removeItem("cart");

        router.replace(`/order-success/${data.orderId}`);
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

      localStorage.removeItem("buy-now");
      localStorage.removeItem("cart");

    } catch (err) {
      console.log("❌ ERROR:", err);
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
          <p>Delivery Address 📍</p>

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

        {/* SELECT */}
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {addresses.map((a) => (
            <div
              key={a.id}
              onClick={() => setAddress(a)}
              className={`p-2 min-w-[120px] rounded cursor-pointer ${
                address?.id === a.id
                  ? "bg-green-500"
                  : "bg-white/20"
              }`}
            >
              {a.name}
            </div>
          ))}
        </div>

      </div>

      {/* PAYMENT */}
      <div className="bg-white/20 p-4 rounded mb-4">
        <div className="flex gap-3">
          <button onClick={() => setPaymentMethod("ONLINE")}>
            Online
          </button>
          <button onClick={() => setPaymentMethod("COD")}>
            COD
          </button>
        </div>
      </div>

      {/* TOTAL */}
      <div className="bg-white/20 p-4 rounded mb-4">
        Total ₹{total}
      </div>

      <button
        onClick={handlePayment}
        className="fixed bottom-5 left-4 right-4 bg-black py-4 rounded-xl"
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

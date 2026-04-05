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

  const [blocked, setBlocked] = useState(false); // 🔥 BACK CONTROL

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
  // 🔥 BACK BUTTON FIX (NO UI FLASH)
  // =========================
  useEffect(() => {
    const handleBack = () => {
      setBlocked(true); // 🔥 UI hata do
      router.replace("/"); // 🔥 home bhejo
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, []);

  // 🔥 BLOCK UI
  if (blocked) return null;

  // =========================
  // 🔥 LOAD DATA
  // =========================
  const loadData = async (u: any) => {

    const buyNow = localStorage.getItem("buy-now");

    if (buyNow) {
      const parsed = JSON.parse(buyNow);

      if (parsed?.price) {
        setItems([{
          ...parsed,
          qty: Number(parsed.quantity) || 1,
          price: Number(parsed.price) || 0,
          basePrice: Number(parsed.basePrice || parsed.price) || 0,
          image: parsed.image || "/no-image.png"
        }]);
      } else {
        setItems([]);
      }

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

    const savedId = localStorage.getItem("selectedAddressId");

    const selected =
      all.find(a => a.id === savedId) ||
      defaultAddr ||
      all[0] ||
      null;

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

      // COD
      if (paymentMethod === "COD") {

        const res = await fetch("/api/orders/cod", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(orderData)
        });

        const data = await res.json();

        if (!data.success) return alert("Order failed ❌");

        localStorage.removeItem("buy-now");

        router.push(`/order-success/${data.orderId}`);
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

        {address && (
          <div className="text-sm">
            <p>{address.name}</p>
            <p>{address.phone}</p>
            <p>{address.address}</p>
          </div>
        )}

        {/* SELECT */}
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {addresses.map(a => (
            <div
              key={a.id}
              onClick={() => {
                setAddress(a);
                localStorage.setItem("selectedAddressId", a.id);
              }}
              className={`p-2 rounded ${
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

      {/* SUMMARY */}
      <div className="bg-white/20 p-4 rounded mb-4">
        <p>Items: ₹{itemsTotal}</p>
        <p>Shipping: ₹{shipping}</p>
        <p>Total: ₹{total}</p>
      </div>

      {/* BUTTON */}
      <button
        onClick={handlePayment}
        className="fixed bottom-5 left-4 right-4 bg-black text-white py-4 rounded-xl"
      >
        Pay ₹{total}
      </button>

    </div>
  );
}

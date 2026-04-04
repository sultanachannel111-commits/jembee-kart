"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { load } from "@cashfreepayments/cashfree-js";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {

  const [cashfree, setCashfree] = useState<any>(null);

  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);

  const [payment, setPayment] = useState("COD");
  const [loading, setLoading] = useState(false);

  const [shippingConfig, setShippingConfig] = useState({
    prepaid: 0,
    cod: 0,
    freeShippingAbove: 0
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [refSeller, setRefSeller] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  const router = useRouter();

  // 🔥 INIT CASHFREE
  useEffect(() => {
    load({ mode: "production" }).then(setCashfree);
  }, []);

  // 🔥 LOAD DATA
  useEffect(() => {

    if (typeof window !== "undefined") {

      setRefSeller(localStorage.getItem("refSeller"));

      const buyNow = localStorage.getItem("buy-now");

      if (buyNow) {
        const parsed = JSON.parse(buyNow);

        setItems([
          {
            ...parsed,
            qty: Number(parsed.quantity) || 1,
            price: Number(parsed.price) || 0,
            basePrice: Number(parsed.basePrice || parsed.price) || 0
          }
        ]);
      }
    }

    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) {
        router.push("/login");
        return;
      }

      setUser(u);

      const addrSnap = await getDocs(
        collection(db, "users", u.uid, "addresses")
      );

      let defaultAddr: any = null;
      addrSnap.forEach(d => {
        if (d.data().isDefault) defaultAddr = d.data();
      });

      setAddress(defaultAddr);

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

  // 💰 CALC
  const itemsTotal = items.reduce(
    (sum, i) => sum + (i.price * i.qty),
    0
  );

  let shipping =
    payment === "COD"
      ? shippingConfig.cod
      : shippingConfig.prepaid;

  if (
    shippingConfig.freeShippingAbove > 0 &&
    itemsTotal >= shippingConfig.freeShippingAbove
  ) {
    shipping = 0;
  }

  const total = itemsTotal + shipping;

  const totalProfit = items.reduce((sum, item) => {
    return sum + (item.price - item.basePrice) * item.qty;
  }, 0);

  const commission = refSeller
    ? Math.floor(totalProfit * 0.5)
    : 0;

  // =========================
  // 🚀 COD ORDER
  // =========================
  const placeOrderCOD = async () => {

    const ref = await addDoc(collection(db, "orders"), {
      userId: user.uid,
      items,
      itemsTotal,
      shipping,
      total,
      paymentMethod: "COD",
      address,
      sellerRef: refSeller || null,
      totalProfit,
      commission,
      status: "Pending",
      createdAt: serverTimestamp()
    });

    if (refSeller && commission > 0) {
      await addDoc(collection(db, "commissions"), {
        sellerId: refSeller,
        orderId: ref.id,
        amount: commission,
        createdAt: serverTimestamp(),
        status: "pending"
      });
    }

    setOrderId(ref.id);
    setShowSuccess(true);
  };

  // =========================
  // 💳 ONLINE PAYMENT
  // =========================
  const handlePayment = async () => {

    if (!address) {
      alert("Add address ❌");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/cashfree", {
        method: "POST",
        body: JSON.stringify({
          amount: total,
          customer_id: user.uid,
          customer_email: user.email,
          customer_phone: address.phone
        })
      });

      const data = await res.json();

      if (!data.payment_session_id) {
        alert("Payment failed ❌");
        return;
      }

      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
      });

    } catch (err: any) {
      alert(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4 pb-28">

      <h1 className="text-3xl font-bold text-center text-white mb-6">
        Checkout 🛍
      </h1>

      {/* ADDRESS */}
      <div className="backdrop-blur-xl bg-white/20 p-4 rounded-2xl mb-4 text-white">
        <div className="flex justify-between">
          <h2>Delivery Address</h2>
          <button onClick={() => router.push("/profile")}>
            Change
          </button>
        </div>

        {address && (
          <div className="mt-2 text-sm">
            <p>{address.name}</p>
            <p>{address.phone}</p>
            <p>{address.address}</p>
          </div>
        )}
      </div>

      {/* ITEMS */}
      {items.map((item, i) => (
        <div key={i} className="bg-white/20 p-3 rounded-xl mb-3 text-white">
          <p>{item.name}</p>
          <p>Qty: {item.qty}</p>
          <p>₹{item.price}</p>
        </div>
      ))}

      {/* PAYMENT */}
      <div className="space-y-3">
        <button onClick={() => setPayment("ONLINE")} className="w-full p-3 bg-white text-black rounded-xl">
          💳 Online Payment
        </button>

        <button onClick={() => setPayment("COD")} className="w-full p-3 bg-white/20 text-white rounded-xl">
          📦 Cash on Delivery
        </button>
      </div>

      {/* SUMMARY */}
      <div className="bg-white/20 p-4 rounded-xl mt-5 text-white">
        <p>Total: ₹{total}</p>
      </div>

      {/* BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-3">

        {payment === "ONLINE" ? (
          <button
            onClick={handlePayment}
            className="w-full py-4 bg-green-500 text-white rounded-xl"
          >
            Pay Online ₹{total}
          </button>
        ) : (
          <button
            onClick={placeOrderCOD}
            className="w-full py-4 bg-purple-600 text-white rounded-xl"
          >
            Place COD Order ₹{total}
          </button>
        )}

      </div>

    </div>
  );
}

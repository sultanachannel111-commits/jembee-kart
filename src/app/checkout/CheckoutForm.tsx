"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
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
import { load } from "@cashfreepayments/cashfree-js";

export default function CheckoutPage() {

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

  // 🔥 LOAD
  useEffect(() => {

    if (typeof window !== "undefined") {

      const seller = localStorage.getItem("refSeller");
      console.log("👤 refSeller:", seller);
      setRefSeller(seller);

      const buyNow = localStorage.getItem("buy-now");
      console.log("🛒 buyNow:", buyNow);

      if (buyNow) {
        try {
          const parsed = JSON.parse(buyNow);

          setItems([
            {
              ...parsed,
              qty: Number(parsed.quantity) || 1,
              price: Number(parsed.price) || 0,
              basePrice: Number(parsed.basePrice || parsed.price) || 0
            }
          ]);
        } catch (e) {
          console.log("❌ JSON ERROR:", e);
        }
      }
    }

    const unsub = onAuthStateChanged(auth, async (u) => {

      console.log("👤 USER:", u);

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

      console.log("📍 ADDRESS:", defaultAddr);
      setAddress(defaultAddr);

      const shipSnap = await getDoc(doc(db, "config", "shipping"));

      if (shipSnap.exists()) {
        const data = shipSnap.data();

        console.log("🚚 SHIPPING:", data);

        setShippingConfig({
          prepaid: Number(data.prepaid) || 0,
          cod: Number(data.cod) || 0,
          freeShippingAbove: Number(data.freeShippingAbove) || 0
        });
      }

    });

    return () => unsub();

  }, []);

  // 💰 TOTAL
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

  console.log("💰 TOTAL:", { itemsTotal, shipping, total });

  // 🚀 ONLINE PAYMENT (DEBUG VERSION)
  const handleOnlinePayment = async () => {

    if (!address) {
      alert("Add address first ❌");
      return;
    }

    try {
      setLoading(true);

      console.log("🚀 Creating order...");

      const res = await fetch("/api/create-order", {
        method: "POST",
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

      console.log("🔥 CREATE ORDER RESPONSE:", data);

      if (!data.payment_session_id) {
        alert("❌ Payment session not received");
        setLoading(false);
        return;
      }

      const cashfree = await load({
        mode: process.env.NODE_ENV === "production" ? "production" : "sandbox"
      });

      console.log("💳 Opening Cashfree...");

      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_modal"
      });

      console.log("🔍 Verifying payment...");

      const verifyRes = await fetch("/api/verify-payment", {
        method: "POST",
        body: JSON.stringify({ orderId: data.order_id })
      });

      const verifyData = await verifyRes.json();

      console.log("✅ VERIFY RESPONSE:", verifyData);

      if (!verifyData.success) {
        alert("❌ Payment not verified");
        setLoading(false);
        return;
      }

      alert("✅ Payment success");

      // 🔥 SAVE ORDER
      const ref = await addDoc(collection(db, "orders"), {
        userId: user.uid,
        items,
        itemsTotal,
        shipping,
        total,
        paymentMethod: "ONLINE",
        address,
        sellerRef: refSeller || null,
        status: "Paid",
        createdAt: serverTimestamp()
      });

      setOrderId(ref.id);
      setShowSuccess(true);

      setTimeout(() => {
        router.push("/profile");
      }, 2000);

    } catch (err: any) {
      console.log("❌ PAYMENT ERROR:", err);
      alert("Payment failed ❌");
    }

    setLoading(false);
  };

  // 🚀 COD
  const placeOrder = async () => {

    if (!address) {
      alert("Add address ❌");
      return;
    }

    try {
      setLoading(true);

      const ref = await addDoc(collection(db, "orders"), {
        userId: user.uid,
        items,
        itemsTotal,
        shipping,
        total,
        paymentMethod: "COD",
        address,
        sellerRef: refSeller || null,
        status: "Pending",
        createdAt: serverTimestamp()
      });

      setOrderId(ref.id);
      setShowSuccess(true);

      setTimeout(() => router.push("/profile"), 2000);

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

      {/* BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-3 backdrop-blur-xl bg-white/20 border-t border-white/30">
        <button
          onClick={() => payment === "ONLINE" ? handleOnlinePayment() : placeOrder()}
          disabled={loading}
          className="w-full py-4 rounded-xl text-white font-bold bg-gradient-to-r from-purple-700 to-pink-600"
        >
          {loading ? "Processing..." : `Pay ₹${total} 🚀`}
        </button>
      </div>

      {/* SUCCESS */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl text-center">
            <h2>Order Success 🎉</h2>
            <p>{orderId}</p>
          </div>
        </div>
      )}

    </div>
  );
}

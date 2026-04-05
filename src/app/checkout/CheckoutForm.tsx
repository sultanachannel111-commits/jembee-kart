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

  const [payment, setPayment] = useState("ONLINE");
  const [loading, setLoading] = useState(false);

  const [shippingConfig, setShippingConfig] = useState({
    prepaid: 0,
    cod: 0,
    freeShippingAbove: 0
  });

  const [items, setItems] = useState<any[]>([]);
  const [refSeller, setRefSeller] = useState<string | null>(null);

  const [orderId, setOrderId] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // 🧪 DEBUG STATES
  const [debugCreate, setDebugCreate] = useState("");
  const [debugVerify, setDebugVerify] = useState("");
  const [debugError, setDebugError] = useState("");

  const router = useRouter();

  // 🔥 LOAD DATA
  useEffect(() => {

    if (typeof window !== "undefined") {

      const seller = localStorage.getItem("refSeller");
      setRefSeller(seller);

      const buyNow = localStorage.getItem("buy-now");

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
          console.log("JSON ERROR:", e);
        }
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

  // 💰 PROFIT
  const totalProfit = items.reduce((sum, item) => {
    return sum + (item.price - item.basePrice) * item.qty;
  }, 0);

  const commission = refSeller
    ? Math.floor(totalProfit * 0.5)
    : 0;

  // 🚀 ONLINE PAYMENT
  const handleOnlinePayment = async () => {

    if (!address) {
      alert("Add address first ❌");
      return;
    }

    try {
      setLoading(true);
      setDebugError("");

      console.log("🚀 Creating order...");

      const res = await fetch("/api/orders/create", {
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

      console.log("🔥 CREATE:", data);
      setDebugCreate(JSON.stringify(data, null, 2));

      if (!data.payment_session_id) {
        setDebugError("No payment_session_id ❌");
        setLoading(false);
        return;
      }

      const cashfree = await load({
        mode: process.env.NODE_ENV === "production" ? "production" : "sandbox"
      });

      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_modal"
      });

      // ✅ VERIFY
      const verifyRes = await fetch("/api/verify-payment", {
        method: "POST",
        body: JSON.stringify({
          orderId: data.order_id
        })
      });

      const verifyData = await verifyRes.json();

      console.log("✅ VERIFY:", verifyData);
      setDebugVerify(JSON.stringify(verifyData, null, 2));

      if (!verifyData.success) {
        setDebugError("Payment not verified ❌");
        setLoading(false);
        return;
      }

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
        totalProfit,
        commission,
        status: "Paid",
        createdAt: serverTimestamp()
      });

      setOrderId(ref.id);
      setShowSuccess(true);

      setTimeout(() => router.push("/profile"), 2000);

    } catch (err: any) {
      console.log("❌ ERROR:", err);
      setDebugError(err.message);
      alert("Payment error ❌");
    }

    setLoading(false);
  };

  // 🚀 COD
  const placeOrder = async () => {

    if (!address) {
      alert("Add address ❌");
      return;
    }

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

    setOrderId(ref.id);
    setShowSuccess(true);

    setTimeout(() => router.push("/profile"), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4 pb-32">

      <h1 className="text-3xl font-bold text-center text-white mb-6">
        Checkout 🛍
      </h1>

      {/* DEBUG PANEL */}
      <div className="bg-black/70 text-white p-4 rounded-xl text-xs space-y-2 mb-4">
        <p>Seller: {refSeller || "None"}</p>
        <p>Profit: {totalProfit}</p>
        <p>Commission: {commission}</p>

        {items.map((item, i) => (
          <p key={i}>
            Item {i + 1}: {item.basePrice} → {item.price}
          </p>
        ))}

        <hr />

        <p>CreateOrder: {debugCreate}</p>
        <p>Verify: {debugVerify}</p>
        <p className="text-red-400">Error: {debugError}</p>
      </div>

      {/* SUMMARY */}
      <div className="backdrop-blur-xl bg-white/20 border border-white/30 p-4 rounded-xl text-white">
        <p>Items: ₹{itemsTotal}</p>
        <p>Shipping: ₹{shipping}</p>
        <p className="font-bold">Total: ₹{total}</p>
      </div>

      {/* BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-3 backdrop-blur-xl bg-white/20">
        <button
          onClick={() => payment === "ONLINE" ? handleOnlinePayment() : placeOrder()}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-700 to-pink-600 text-white font-bold"
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

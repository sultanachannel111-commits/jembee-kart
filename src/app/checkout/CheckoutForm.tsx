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

  const DEBUG = true;

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

  const [debugData, setDebugData] = useState<any>({});

  const router = useRouter();

  // 🔥 LOAD DATA
  useEffect(() => {

    if (typeof window !== "undefined") {

      const seller = localStorage.getItem("refSeller");
      const buyNow = localStorage.getItem("buy-now");

      console.log("👤 Seller:", seller);
      console.log("🛒 BuyNow:", buyNow);

      setRefSeller(seller);

      if (buyNow) {
        try {
          const parsed = JSON.parse(buyNow);

          setItems([{
            ...parsed,
            qty: Number(parsed.quantity) || 1,
            price: Number(parsed.price) || 0,
            basePrice: Number(parsed.basePrice || parsed.price) || 0
          }]);

        } catch (e) {
          console.log("❌ JSON ERROR:", e);
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

      console.log("📍 Address:", defaultAddr);
      setAddress(defaultAddr);

      const shipSnap = await getDoc(doc(db, "config", "shipping"));

      if (shipSnap.exists()) {
        const data = shipSnap.data();

        console.log("🚚 Shipping:", data);

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
      alert("Add address ❌");
      return;
    }

    try {
      setLoading(true);

      const orderIdGenerated = "order_" + Date.now();

      console.log("🚀 Creating Order:", orderIdGenerated);

      const res = await fetch("/api/cashfree/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderId: orderIdGenerated,
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

      console.log("🔥 CREATE ORDER:", data);

      setDebugData((prev:any)=>({...prev, createOrder:data}));

      if (!data.payment_session_id || !data.order_id) {
        alert("❌ Payment init failed");
        setLoading(false);
        return;
      }

      const cashfree = await load({
        mode: "sandbox"
      });

      console.log("💳 Opening payment UI...");

      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
      });

      // VERIFY
      console.log("🔍 Verifying payment...");

      const verifyRes = await fetch("/api/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderId: data.order_id
        })
      });

      const verifyData = await verifyRes.json();

      console.log("✅ VERIFY:", verifyData);

      setDebugData((prev:any)=>({...prev, verify:verifyData}));

      if (!verifyData.success) {
        alert("❌ Payment failed");
        setLoading(false);
        return;
      }

      alert("✅ Payment success");

      // SAVE ORDER
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

    } catch (err:any) {
      console.log("❌ PAYMENT ERROR:", err);
      setDebugData((prev:any)=>({...prev, error:err.message}));
      alert("Payment error ❌");
    }

    setLoading(false);
  };

  // 🚀 COD
  const placeOrder = async () => {

    if (!address) return alert("Add address ❌");

    const ref = await addDoc(collection(db, "orders"), {
      userId: user.uid,
      items,
      itemsTotal,
      shipping,
      total,
      paymentMethod: "COD",
      address,
      sellerRef: refSeller,
      totalProfit,
      commission,
      status: "Pending",
      createdAt: serverTimestamp()
    });

    setOrderId(ref.id);
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4 pb-28 text-white">

      <h1 className="text-3xl font-bold text-center mb-6">
        Checkout 🛍
      </h1>

      {/* ADDRESS */}
      <div className="bg-white/20 p-4 rounded-xl mb-3">
        <p>{address?.name}</p>
        <p>{address?.phone}</p>
        <p>{address?.address}</p>
      </div>

      {/* ITEMS */}
      {items.map((item, i) => (
        <div key={i} className="bg-white/20 p-3 rounded-xl mb-2">
          {item.name} — ₹{item.price} × {item.qty}
        </div>
      ))}

      {/* SUMMARY */}
      <div className="bg-white/20 p-4 rounded-xl mt-3">
        <p>Items: ₹{itemsTotal}</p>
        <p>Shipping: ₹{shipping}</p>
        <p>Total: ₹{total}</p>
      </div>

      {/* BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-3 bg-black/30">
        <button
          onClick={handleOnlinePayment}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-700 to-pink-600"
        >
          {loading ? "Processing..." : `Pay ₹${total}`}
        </button>
      </div>

      {/* DEBUG PANEL */}
      {DEBUG && (
        <div className="fixed bottom-24 left-2 right-2 bg-black/80 p-3 text-xs rounded-xl space-y-1">

          <p>Seller: {refSeller || "None"}</p>
          <p>Profit: {totalProfit}</p>
          <p>Commission: {commission}</p>

          {items.map((item, i) => (
            <p key={i}>
              Item {i+1}: {item.basePrice} → {item.price}
            </p>
          ))}

          <hr/>

          <p>CreateOrder: {JSON.stringify(debugData.createOrder)}</p>
          <p>Verify: {JSON.stringify(debugData.verify)}</p>
          <p>Error: {debugData.error}</p>

        </div>
      )}

      {/* SUCCESS */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white text-black p-5 rounded-xl">
            Order Success 🎉<br/>
            {orderId}
          </div>
        </div>
      )}

    </div>
  );
}

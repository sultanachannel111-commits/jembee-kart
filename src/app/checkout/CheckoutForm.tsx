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
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<any[]>([]);
  const [refSeller, setRefSeller] = useState<string | null>(null);

  const [shippingConfig, setShippingConfig] = useState({
    prepaid: 0,
    cod: 0,
    freeShippingAbove: 0
  });

  const [debug, setDebug] = useState("");

  const router = useRouter();

  // 🔥 LOAD DATA
  useEffect(() => {

    const seller = localStorage.getItem("refSeller");
    setRefSeller(seller);

    const buyNow = localStorage.getItem("buy-now");

    if (buyNow) {
      const parsed = JSON.parse(buyNow);

      setItems([{
        ...parsed,
        qty: Number(parsed.quantity) || 1,
        price: Number(parsed.price) || 0,
        basePrice: Number(parsed.basePrice || parsed.price) || 0
      }]);
    }

    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) return router.push("/login");

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
  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  let shipping = shippingConfig.prepaid;

  if (
    shippingConfig.freeShippingAbove > 0 &&
    itemsTotal >= shippingConfig.freeShippingAbove
  ) {
    shipping = 0;
  }

  const total = itemsTotal + shipping;

  // 💰 PROFIT + COMMISSION
  const totalProfit = items.reduce((sum, item) => {
    return sum + (item.price - item.basePrice) * item.qty;
  }, 0);

  const commission = refSeller
    ? Math.floor(totalProfit * 0.5)
    : 0;

  // 🚀 PAYMENT
  const handlePayment = async () => {

    if (!address) {
      alert("Add address ❌");
      return;
    }

    try {
      setLoading(true);
      setDebug("");

      const orderData = {
        userId: user.uid,
        items,
        itemsTotal,
        shipping,
        total,
        address,
        sellerRef: refSeller || null
      };

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

      console.log("🔥 CREATE:", data);

      if (!data.payment_session_id) {
        setDebug("❌ No session id");
        return;
      }

      const cashfree = await load({
        mode: process.env.NODE_ENV === "production" ? "production" : "sandbox"
      });

      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
      });

      // 🔥 SAVE TEMP ORDER
      localStorage.setItem("orderData", JSON.stringify({
        ...orderData,
        cashfreeOrderId: data.order_id
      }));

    } catch (err: any) {
      console.log(err);
      setDebug(err.message);
      alert("Payment error ❌");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4 pb-32">

      {/* TITLE */}
      <h1 className="text-3xl font-bold text-center text-white mb-6 drop-shadow-lg">
        Checkout 🛍
      </h1>

      {/* SUMMARY */}
      <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl p-4 shadow-xl text-white mb-4">

        <h2 className="font-semibold mb-2">💰 Order Summary</h2>

        <div className="flex justify-between">
          <span>Items</span>
          <span>₹{itemsTotal}</span>
        </div>

        <div className="flex justify-between">
          <span>Shipping</span>
          <span>₹{shipping}</span>
        </div>

        <hr className="my-2 border-white/30" />

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₹{total}</span>
        </div>

      </div>

      {/* ITEMS */}
      {items.map((item, i) => (
        <div key={i} className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-xl p-3 flex gap-3 mb-3 shadow text-white">

          <img src={item.image} className="w-16 h-16 rounded-lg object-cover" />

          <div className="flex-1">
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm opacity-80">Qty: {item.qty}</p>
            <p className="text-green-300 font-bold">₹{item.price}</p>
          </div>

        </div>
      ))}

      {/* DEBUG PANEL */}
      <div className="backdrop-blur-xl bg-black/40 border border-white/20 rounded-xl p-3 text-xs text-white mb-4 space-y-1">

        <p>Seller: {refSeller || "None"}</p>
        <p>Profit: {totalProfit}</p>
        <p>Commission: {commission}</p>

        <hr className="border-white/20"/>

        <p>🚚 Shipping Config:</p>
        <p>Prepaid: ₹{shippingConfig.prepaid}</p>
        <p>COD: ₹{shippingConfig.cod}</p>
        <p>Free Above: ₹{shippingConfig.freeShippingAbove}</p>

        <hr className="border-white/20"/>

        {items.map((item, i) => (
          <p key={i}>
            Item {i + 1}: {item.basePrice} → {item.price}
          </p>
        ))}

        <p className="text-red-300">{debug}</p>

      </div>

      {/* BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-3 backdrop-blur-xl bg-white/20 border-t border-white/30">

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-4 rounded-xl text-white font-bold bg-gradient-to-r from-purple-700 to-pink-600 shadow-xl active:scale-95 transition"
        >
          {loading ? "Processing..." : `Pay ₹${total} 🚀`}
        </button>

      </div>

    </div>
  );
}

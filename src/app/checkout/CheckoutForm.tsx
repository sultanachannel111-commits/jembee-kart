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
        } catch {}
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

  // 🚀 CASHFREE PAYMENT
  const handleOnlinePayment = async () => {

    if (!address) {
      alert("Add address first ❌");
      return;
    }

    try {

      setLoading(true);

      const res = await fetch("/api/cashfree/create-order", {
        method: "POST",
        body: JSON.stringify({
          amount: total,
          userId: user.uid,
          email: user.email,
          phone: address.phone
        })
      });

      const data = await res.json();

      const cashfree = await load({
        mode: "sandbox" // 👉 production me change karna
      });

      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
      });

    } catch (err) {
      alert("Payment failed ❌");
      setLoading(false);
    }
  };

  // 🚀 COD ORDER
  const placeOrder = async () => {

    if (!address) {
      alert("Please add address ❌");
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
        paymentMethod: payment,
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

      setTimeout(() => {
        router.push("/profile");
      }, 2000);

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
      <div className="backdrop-blur-2xl bg-white/20 border border-white/30 p-4 rounded-2xl shadow-xl mb-4 text-white">

        <div className="flex justify-between">
          <h2 className="font-semibold">Delivery Address</h2>
          <button onClick={() => router.push("/profile")} className="underline text-sm">
            Change
          </button>
        </div>

        {address ? (
          <div className="mt-2 text-sm space-y-1">
            <p className="font-semibold">{address.name}</p>
            <p>{address.phone}</p>
            <p>{address.address}</p>
            <p>{address.city} - {address.pincode}</p>
          </div>
        ) : (
          <p className="text-red-200 mt-2">No address found ❌</p>
        )}

      </div>

      {/* ITEMS */}
      {items.map((item, i) => (
        <div key={i} className="backdrop-blur-2xl bg-white/20 border border-white/30 p-3 rounded-xl shadow mb-3 flex gap-3 text-white">

          <img src={item.image} className="w-16 h-16 rounded-lg object-cover"/>

          <div className="flex-1">
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm opacity-80">Qty: {item.qty}</p>
            <p className="font-bold text-green-300">₹{item.price}</p>
          </div>

        </div>
      ))}

      {/* PAYMENT */}
      <div className="mt-6 space-y-3">

        <div
          onClick={() => setPayment("ONLINE")}
          className={`p-3 rounded-xl cursor-pointer ${
            payment === "ONLINE"
              ? "bg-white text-black shadow-lg"
              : "bg-white/20 text-white border border-white/30"
          }`}
        >
          💳 Online Payment (+₹{shippingConfig.prepaid})
        </div>

        <div
          onClick={() => setPayment("COD")}
          className={`p-3 rounded-xl cursor-pointer ${
            payment === "COD"
              ? "bg-white text-black shadow-lg"
              : "bg-white/20 text-white border border-white/30"
          }`}
        >
          📦 Cash on Delivery (+₹{shippingConfig.cod})
        </div>

      </div>

      {/* SUMMARY */}
      <div className="mt-6 backdrop-blur-2xl bg-white/20 border border-white/30 p-4 rounded-2xl text-white">

        <div className="flex justify-between">
          <span>Items</span>
          <span>₹{itemsTotal}</span>
        </div>

        <div className="flex justify-between">
          <span>Shipping</span>
          <span>₹{shipping}</span>
        </div>

        <hr className="my-2 border-white/30"/>

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₹{total}</span>
        </div>

      </div>

      {/* BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-3 backdrop-blur-xl bg-white/20 border-t border-white/30">

        <button
          onClick={() => {
            if (payment === "ONLINE") {
              handleOnlinePayment();
            } else {
              placeOrder();
            }
          }}
          disabled={loading}
          className="w-full py-4 rounded-xl text-white font-bold bg-gradient-to-r from-purple-700 to-pink-600 shadow-xl"
        >
          {loading ? "Processing..." : `Pay ₹${total} 🚀`}
        </button>

      </div>

      {/* SUCCESS */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="backdrop-blur-2xl bg-white/20 border border-white/30 p-6 rounded-2xl text-center text-white w-[90%] max-w-sm">

            <div className="text-5xl mb-3">🎉</div>

            <h2 className="text-xl font-bold">
              Order Placed Successfully
            </h2>

            <p className="text-sm mt-2">
              Order ID: {orderId}
            </p>

          </div>

        </div>
      )}

    </div>
  );
}

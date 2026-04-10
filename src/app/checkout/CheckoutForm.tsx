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
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");

  const [shippingConfig, setShippingConfig] = useState({
    prepaid: 0,
    cod: 0,
    freeShippingAbove: 0
  });

  const router = useRouter();

  // =========================
  // 🔥 DATA INITIALIZATION
  // =========================
  useEffect(() => {
    let unsubscribe;
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.push("/login");
      setUser(u);

      // 1. Load Items (Buy Now or Cart)
      const buyNow = localStorage.getItem("buy-now");
      if (buyNow) {
        try {
          const parsed = JSON.parse(buyNow);
          if (parsed && parsed.price > 0) {
            setItems([{
              id: "buy-now",
              productId: parsed.productId,
              name: parsed.name,
              image: parsed.image || "/no-image.png",
              price: Number(parsed.price) || 0,
              qty: Number(parsed.quantity) || 1
            }]);
          }
        } catch { setItems([]); }
      } else {
        const ref = collection(db, "carts", u.uid, "items");
        unsubscribe = onSnapshot(ref, (snap) => {
          const data = [];
          snap.forEach(docSnap => {
            const d = docSnap.data();
            const price = d?.variations?.[0]?.sizes?.[0]?.sellPrice || d.price || 0;
            data.push({
              id: docSnap.id,
              productId: d.productId,
              name: d.name,
              image: d.image || "/no-image.png",
              price: Number(price) || 0,
              qty: Number(d.quantity) || 1
            });
          });
          setItems(data);
        });
      }

      // 2. Fetch Addresses
      const addrSnap = await getDocs(collection(db, "addresses")); 
      const userAddresses = [];
      addrSnap.forEach(d => {
        if (d.data().userId === u.uid) {
          userAddresses.push({ id: d.id, ...d.data() });
        }
      });
      setAddresses(userAddresses);
      setAddress(userAddresses[0] || null);

      // 3. Shipping Config
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

    return () => { unsub(); if (unsubscribe) unsubscribe(); };
  }, [router]);

  // =========================
  // 💰 PRICE CALCULATION
  // =========================
  const itemsTotal = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
  let shipping = items.length === 0 ? 0 : 
    (paymentMethod === "COD" ? shippingConfig.cod : shippingConfig.prepaid);

  if (shippingConfig.freeShippingAbove > 0 && itemsTotal >= shippingConfig.freeShippingAbove) {
    shipping = 0;
  }
  const total = items.length === 0 ? 0 : itemsTotal + shipping;

  // =========================
  // 🚀 PAYMENT LOGIC
  // =========================
  const handlePayment = async () => {
    if (!address) return alert("Please select a delivery address 📍");
    if (items.length === 0) return alert("Your cart is empty 🛒");

    try {
      setLoading(true);
      const orderData = {
        userId: user.uid,
        email: user.email,
        items,
        itemsTotal,
        shipping,
        total,
        address, 
        paymentMethod,
        createdAt: new Date()
      };

      if (paymentMethod === "COD") {
        const res = await fetch("/api/orders/cod", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData)
        });
        const data = await res.json();
        if (data.success) {
          localStorage.removeItem("buy-now");
          router.replace(`/order-success/${data.orderId}`);
        } else { alert("Order Failed ❌"); }
      } else {
        const res = await fetch("/api/cashfree/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            customer: {
              uid: user.uid,
              name: address.name || user.displayName || "Customer",
              email: user.email,
              phone: address.phone
            },
            orderData
          })
        });
        
        const data = await res.json();
        const cashfree = await load({ mode: "production" });
        localStorage.removeItem("buy-now");
        await cashfree.checkout({ 
          paymentSessionId: data.payment_session_id, 
          redirectTarget: "_self" 
        });
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong! ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 pb-44 font-sans max-w-md mx-auto">
      
      {/* HEADER */}
      <header className="py-8 text-center border-b border-gray-100 mb-6">
        <h1 className="text-xl font-black tracking-widest uppercase">
          Finalize Order
        </h1>
        <div className="h-1 w-12 bg-indigo-600 mx-auto mt-2 rounded-full" />
      </header>

      {/* 📍 ADDRESS SECTION */}
      <section className="bg-gray-50 border border-gray-200 p-5 rounded-3xl mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Shipping To</h2>
          <button onClick={() => router.push("/profile")} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full uppercase border border-indigo-100">
            Change
          </button>
        </div>

        {address ? (
          <div className="space-y-1">
            <p className="text-lg font-extrabold uppercase tracking-tight text-gray-900">{address.name}</p>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="leading-snug">{address.street}</p>
              {address.landmark && <p className="text-indigo-600 text-xs font-medium">Near {address.landmark}</p>}
              <p className="font-bold text-gray-800">{address.city}, {address.state} - {address.zip}</p>
              <p className="pt-2 font-black text-gray-900">📞 {address.phone}</p>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center border-2 border-dashed border-gray-200 rounded-2xl">
            <button onClick={() => router.push("/profile")} className="text-indigo-600 text-xs font-black uppercase underline">Add Delivery Address</button>
          </div>
        )}
      </section>

      {/* 💳 PAYMENT TOGGLE */}
      <section className="bg-gray-100 p-1.5 rounded-2xl flex gap-2 mb-8 border border-gray-200">
        <button 
          onClick={() => setPaymentMethod("ONLINE")}
          className={`flex-1 py-3.5 rounded-xl font-black text-xs tracking-widest transition-all ${paymentMethod === "ONLINE" ? "bg-white text-black shadow-md border border-gray-200" : "text-gray-400"}`}
        >
          ONLINE 💳
        </button>
        <button 
          onClick={() => setPaymentMethod("COD")}
          className={`flex-1 py-3.5 rounded-xl font-black text-xs tracking-widest transition-all ${paymentMethod === "COD" ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-gray-400"}`}
        >
          CASH 🚚
        </button>
      </section>

      {/* 📦 ITEMS SUMMARY */}
      <div className="space-y-3 mb-8">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Bag Content</h3>
        {items.map((item) => (
          <div key={item.id} className="bg-white border border-gray-100 p-3 rounded-2xl flex gap-4 items-center shadow-sm">
            <img src={item.image} className="w-14 h-14 rounded-xl object-cover bg-gray-50 border border-gray-100" alt="product" />
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-sm uppercase truncate text-gray-900">{item.name}</p>
              <div className="flex justify-between items-center mt-0.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Qty: {item.qty}</p>
                <p className="text-gray-900 font-black italic">₹{item.price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 💰 TOTAL BILL */}
      <section className="bg-gray-50 border border-gray-200 p-6 rounded-3xl space-y-3 mb-10">
        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
          <span>Subtotal</span>
          <span className="text-gray-900 font-black">₹{itemsTotal}</span>
        </div>
        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
          <span>Delivery</span>
          <span className={shipping === 0 ? "text-green-600" : "text-gray-900 font-black"}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
        </div>
        <div className="h-px bg-gray-200" />
        <div className="flex justify-between items-center pt-1">
          <span className="text-sm font-black uppercase tracking-tighter text-gray-900">Total Amount</span>
          <span className="text-2xl font-black italic tracking-tighter text-indigo-600">₹{total}</span>
        </div>
      </section>

      {/* 🚀 FIXED FOOTER BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-white border-t border-gray-100 z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <button
          onClick={handlePayment}
          disabled={loading || items.length === 0}
          className="w-full max-w-md mx-auto block py-5 rounded-2xl bg-indigo-600 text-white font-black text-xs tracking-widest uppercase shadow-xl shadow-indigo-100 active:scale-95 transition-all disabled:bg-gray-300"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            `Place Order • ₹${total}`
          )}
        </button>
      </div>
    </div>
  );
}

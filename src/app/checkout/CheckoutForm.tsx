"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  addDoc
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

      // 1. Load Items (Priority: Buy Now > Cart)
      const buyNowRaw = localStorage.getItem("buy-now");
      
      if (buyNowRaw) {
        try {
          const parsed = JSON.parse(buyNowRaw);
          // FIX: Direct price usage to avoid mismatch
          if (parsed && parsed.price) {
            setItems([{
              id: "buy-now",
              productId: parsed.productId,
              name: parsed.name,
              image: parsed.image || "/no-image.png",
              price: Number(parsed.price),
              qty: Number(parsed.quantity) || 1
            }]);
          }
        } catch (e) { setItems([]); }
      } else {
        const ref = collection(db, "carts", u.uid, "items");
        unsubscribe = onSnapshot(ref, (snap) => {
          const data = [];
          snap.forEach(docSnap => {
            const d = docSnap.data();
            // FIX: Checking for variation price first
            const itemPrice = d.variations?.[0]?.sizes?.[0]?.sellPrice ?? d.price ?? 0;
            data.push({
              id: docSnap.id,
              productId: d.productId,
              name: d.name,
              image: d.image || "/no-image.png",
              price: Number(itemPrice),
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
        status: paymentMethod === "COD" ? "PLACED" : "PENDING",
        createdAt: new Date().toISOString()
      };

      if (paymentMethod === "COD") {
        // COD Order Save logic
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
        // ONLINE Payment logic
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
        
        // Iske baad order successful tabhi hoga jab payment complete hoga
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
    <div className="min-h-screen bg-white text-black p-4 pb-48 font-sans max-w-md mx-auto">
      
      {/* HEADER */}
      <header className="py-6 text-center mb-4">
        <h1 className="text-2xl font-black italic tracking-tighter uppercase text-indigo-600">
          Finalize Order
        </h1>
      </header>

      {/* 📍 ADDRESS SECTION */}
      <section className="bg-gray-50 border border-gray-200 p-5 rounded-[2rem] mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Shipping To</h2>
          <button onClick={() => router.push("/profile")} className="text-[10px] font-bold text-white bg-black px-4 py-1.5 rounded-full uppercase">
            Change
          </button>
        </div>

        {address ? (
          <div className="space-y-1">
            <p className="text-lg font-black uppercase text-gray-900">{address.name}</p>
            <div className="text-sm text-gray-600 leading-relaxed">
              <p>{address.street}</p>
              {address.landmark && <p className="text-indigo-600 font-medium">Near {address.landmark}</p>}
              <p className="font-bold">{address.city}, {address.state} - {address.zip}</p>
              <p className="mt-2 font-black text-gray-900">📞 {address.phone}</p>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center border-2 border-dashed border-gray-200 rounded-2xl">
            <button onClick={() => router.push("/profile")} className="text-indigo-600 text-xs font-black uppercase">Add Delivery Address</button>
          </div>
        )}
      </section>

      {/* 💳 PAYMENT TOGGLE */}
      <section className="bg-gray-100 p-1.5 rounded-2xl flex gap-2 mb-8">
        <button 
          onClick={() => setPaymentMethod("ONLINE")}
          className={`flex-1 py-4 rounded-xl font-black text-xs tracking-widest transition-all ${paymentMethod === "ONLINE" ? "bg-white text-black shadow-sm" : "text-gray-400"}`}
        >
          ONLINE 💳
        </button>
        <button 
          onClick={() => setPaymentMethod("COD")}
          className={`flex-1 py-4 rounded-xl font-black text-xs tracking-widest transition-all ${paymentMethod === "COD" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-400"}`}
        >
          CASH 🚚
        </button>
      </section>

      {/* 📦 ITEMS SUMMARY */}
      <div className="space-y-3 mb-8">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Bag Content</h3>
        {items.map((item) => (
          <div key={item.id} className="bg-gray-50 border border-gray-100 p-3 rounded-2xl flex gap-4 items-center">
            <img src={item.image} className="w-16 h-16 rounded-xl object-cover bg-white" alt="product" />
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm uppercase truncate text-gray-900">{item.name}</p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-[10px] font-bold text-gray-400">QTY: {item.qty}</p>
                <p className="text-indigo-600 font-black italic">₹{item.price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 💰 TOTAL BILL */}
      <section className="bg-white border-2 border-gray-100 p-6 rounded-[2rem] space-y-3 mb-10">
        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
          <span>Subtotal</span>
          <span className="text-gray-900 font-black">₹{itemsTotal}</span>
        </div>
        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
          <span>Delivery</span>
          <span className={shipping === 0 ? "text-green-600 font-black" : "text-gray-900 font-black"}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
        </div>
        <div className="h-px bg-gray-100 my-2" />
        <div className="flex justify-between items-center">
          <span className="text-sm font-black uppercase text-gray-900">Total Amount</span>
          <span className="text-3xl font-black italic tracking-tighter text-indigo-600">₹{total}</span>
        </div>
      </section>

      {/* 🚀 FIXED FOOTER BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-white/80 backdrop-blur-md border-t border-gray-100 z-[100]">
        <button
          onClick={handlePayment}
          disabled={loading || items.length === 0}
          className="w-full max-w-md mx-auto block py-5 rounded-2xl bg-indigo-600 text-white font-black text-sm tracking-widest uppercase shadow-2xl shadow-indigo-200 active:scale-95 transition-all disabled:bg-gray-300"
        >
          {loading ? "Processing..." : `Place Order • ₹${total}`}
        </button>
      </div>
    </div>
  );
}

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
  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");

  const [shippingConfig, setShippingConfig] = useState({
    prepaid: 0,
    cod: 0,
    freeShippingAbove: 0
  });

  const router = useRouter();

  // =========================
  // 🔥 LOAD DATA (BUY NOW + CART)
  // =========================
  useEffect(() => {
    let unsubscribe: any;
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.push("/login");
      setUser(u);

      // 🟢 BUY NOW (PRIORITY)
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
        // 🛒 FIRESTORE CART
        const ref = collection(db, "carts", u.uid, "items");
        unsubscribe = onSnapshot(ref, (snap) => {
          const data: any[] = [];
          snap.forEach(docSnap => {
            const d: any = docSnap.data();
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

      // 📍 ADDRESS (Including Zip)
      const addrSnap = await getDocs(collection(db, "addresses")); 
      // Note: Make sure your query filters by userId if not using subcollections
      const userAddresses: any[] = [];
      addrSnap.forEach(d => {
        if (d.data().userId === u.uid) {
          userAddresses.push({ id: d.id, ...d.data() });
        }
      });

      setAddresses(userAddresses);
      setAddress(userAddresses[0] || null);

      // 🚚 SHIPPING CONFIG
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

    return () => {
      unsub();
      if (unsubscribe) unsubscribe();
    };
  }, [router]);

  // =========================
  // 💰 CALCULATION LOGIC
  // =========================
  const itemsTotal = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
  
  let shipping = items.length === 0 ? 0 : 
    (paymentMethod === "COD" ? shippingConfig.cod : shippingConfig.prepaid);

  if (shippingConfig.freeShippingAbove > 0 && itemsTotal >= shippingConfig.freeShippingAbove) {
    shipping = 0;
  }

  const total = items.length === 0 ? 0 : itemsTotal + shipping;

  // =========================
  // 🚀 PAYMENT HANDLER
  // =========================
  const handlePayment = async () => {
    if (!address) return alert("Please select a delivery address 📍");
    if (items.length === 0) return alert("Your cart is empty 🛒");

    try {
      setLoading(true);
      const orderData = {
        userId: user.uid,
        items,
        itemsTotal,
        shipping,
        total,
        address
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
        } else {
          alert("Order failed ❌");
        }
      } else {
        const res = await fetch("/api/cashfree/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            customer: {
              uid: user.uid,
              name: user.displayName || address.name,
              email: user.email,
              phone: address.phone
            }
          })
        });
        const data = await res.json();
        const cashfree = await load({ mode: "production" });
        await cashfree.checkout({ paymentSessionId: data.payment_session_id, redirectTarget: "_self" });
        localStorage.removeItem("buy-now");
      }
    } catch (err) {
      console.log(err);
      alert("Payment Error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 pb-36 font-sans">
      {/* HEADER */}
      <header className="py-6 text-center">
        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          CHECKOUT
        </h1>
      </header>

      <div className="max-w-md mx-auto space-y-6">
        
        {/* 📍 ADDRESS CARD */}
        <section className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-[2.5rem] shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-300">Delivery Address</h2>
            <button onClick={() => router.push("/profile")} className="text-xs bg-indigo-500/20 px-3 py-1 rounded-full text-indigo-300 border border-indigo-500/30">
              Edit
            </button>
          </div>

          {address ? (
            <div className="space-y-1">
              <p className="text-lg font-bold">{address.name || user?.displayName || "Customer"}</p>
              <p className="text-white/60 text-sm leading-relaxed">{address.street}</p>
              <p className="text-white/60 text-sm">{address.city} - <span className="text-white font-mono font-bold">{address.zip}</span></p>
              <p className="text-indigo-400 text-sm font-medium mt-2">📞 {address.phone}</p>
            </div>
          ) : (
            <div className="py-4 text-center border-2 border-dashed border-white/10 rounded-2xl">
              <p className="text-white/40 text-sm">No address found ❌</p>
            </div>
          )}
        </section>

        {/* 💳 PAYMENT METHOD */}
        <section className="bg-white/5 backdrop-blur-lg border border-white/10 p-2 rounded-[2rem] flex gap-2">
          <button 
            onClick={() => setPaymentMethod("ONLINE")}
            className={`flex-1 py-4 rounded-[1.5rem] font-bold text-sm transition-all duration-300 ${paymentMethod === "ONLINE" ? "bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)]" : "text-white/40 hover:bg-white/5"}`}
          >
            ONLINE 💳
          </button>
          <button 
            onClick={() => setPaymentMethod("COD")}
            className={`flex-1 py-4 rounded-[1.5rem] font-bold text-sm transition-all duration-300 ${paymentMethod === "COD" ? "bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]" : "text-white/40 hover:bg-white/5"}`}
          >
            CASH 🚚
          </button>
        </section>

        {/* 📦 ORDER ITEMS */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Your Items</h2>
          {items.map((item) => (
            <div key={item.id} className="bg-white/5 backdrop-blur-md border border-white/5 p-3 rounded-3xl flex gap-4 items-center">
              <img src={item.image} className="w-20 h-20 rounded-2xl object-cover bg-white/10" alt={item.name} />
              <div className="flex-1">
                <p className="font-bold text-sm line-clamp-1">{item.name}</p>
                <p className="text-white/40 text-xs mt-1">Quantity: {item.qty}</p>
                <p className="text-indigo-400 font-black mt-1">₹{item.price}</p>
              </div>
            </div>
          ))}
        </section>

        {/* 💰 BILLING DETAILS */}
        <section className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-[2.5rem]">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-white/60">
              <span>Subtotal</span>
              <span>₹{itemsTotal}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Shipping Fee</span>
              <span className={shipping === 0 ? "text-green-400 font-bold" : ""}>
                {shipping === 0 ? "FREE" : `₹${shipping}`}
              </span>
            </div>
            <div className="h-[1px] bg-white/10 my-2" />
            <div className="flex justify-between items-center text-xl font-black">
              <span>Total</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-300">
                ₹{total}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* 🚀 ACTION BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/90 to-transparent">
        <button
          onClick={handlePayment}
          disabled={loading || items.length === 0}
          className="w-full max-w-md mx-auto block py-5 rounded-3xl bg-indigo-600 font-black text-lg shadow-[0_10px_30px_rgba(79,70,229,0.4)] active:scale-95 transition-transform disabled:opacity-50 disabled:grayscale"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              SECURE PAYING...
            </span>
          ) : (
            `PAY ₹${total}`
          )}
        </button>
      </div>
    </div>
  );
}

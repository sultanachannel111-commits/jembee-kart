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

  useEffect(() => {
    let unsubscribe: any;
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.push("/login");
      setUser(u);

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

      const addrSnap = await getDocs(collection(db, "addresses")); 
      const userAddresses: any[] = [];
      addrSnap.forEach(d => {
        if (d.data().userId === u.uid) {
          userAddresses.push({ id: d.id, ...d.data() });
        }
      });
      setAddresses(userAddresses);
      setAddress(userAddresses[0] || null);

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

  const itemsTotal = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
  let shipping = items.length === 0 ? 0 : 
    (paymentMethod === "COD" ? shippingConfig.cod : shippingConfig.prepaid);

  if (shippingConfig.freeShippingAbove > 0 && itemsTotal >= shippingConfig.freeShippingAbove) {
    shipping = 0;
  }
  const total = items.length === 0 ? 0 : itemsTotal + shipping;

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
    <div className="min-h-screen bg-[#070b14] text-white p-4 pb-44 font-sans max-w-md mx-auto selection:bg-indigo-500">
      
      {/* HEADER */}
      <header className="py-10 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-indigo-600/20 blur-[80px]" />
        <h1 className="text-3xl font-black tracking-[0.25em] italic bg-gradient-to-b from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent uppercase">
          Checkout
        </h1>
        <p className="text-[9px] uppercase tracking-[0.4em] text-white/30 mt-2 font-bold">Secure Gateway</p>
      </header>

      {/* 📍 ADDRESS SECTION */}
      <section className="group bg-gradient-to-br from-white/[0.08] to-transparent backdrop-blur-2xl border border-white/10 p-6 rounded-[2.5rem] mb-6 shadow-2xl relative transition-all active:scale-[0.98]">
        <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Delivery To</h2>
          </div>
          <button onClick={() => router.push("/profile")} className="text-[10px] font-black bg-white/5 px-5 py-2.5 rounded-2xl uppercase tracking-tighter border border-white/10 hover:bg-indigo-600 hover:border-indigo-500 transition-all active:scale-90">
            Edit
          </button>
        </div>

        {address ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
               <p className="text-xl font-black italic uppercase tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                {address.name}
              </p>
            </div>
            <div className="text-sm text-white/50 space-y-1.5 font-medium leading-relaxed">
              <p className="flex items-start gap-2">
                <span className="opacity-40 mt-1">🏠</span>
                {address.street}
              </p>
              {address.landmark && (
                <p className="text-indigo-300/60 text-xs italic pl-6">Milo {address.landmark} ke paas</p>
              )}
              <p className="pl-6 text-white/80 font-bold">{address.city}, {address.state} • {address.zip}</p>
              <div className="pt-2 flex items-center gap-2 text-indigo-400 font-black text-xs pl-6">
                <span className="bg-indigo-500/10 px-3 py-1 rounded-full">📞 {address.phone}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center border-2 border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.02]">
            <p className="text-white/20 text-xs mb-4 font-bold uppercase tracking-widest">Address not found</p>
            <button onClick={() => router.push("/profile")} className="bg-white text-black text-[10px] px-8 py-3 rounded-full font-black uppercase shadow-xl hover:bg-indigo-500 hover:text-white transition-colors">Setup Profile</button>
          </div>
        )}
      </section>

      {/* 💳 PAYMENT TOGGLE */}
      <section className="bg-black/40 border border-white/5 p-2 rounded-[2.2rem] flex gap-2 mb-8 shadow-inner">
        <button 
          onClick={() => setPaymentMethod("ONLINE")}
          className={`flex-1 py-4 rounded-[1.8rem] font-black text-[11px] tracking-widest transition-all duration-500 ${paymentMethod === "ONLINE" ? "bg-white text-black shadow-[0_10px_25px_-5px_rgba(255,255,255,0.3)]" : "text-white/20 hover:text-white/40"}`}
        >
          ONLINE 💳
        </button>
        <button 
          onClick={() => setPaymentMethod("COD")}
          className={`flex-1 py-4 rounded-[1.8rem] font-black text-[11px] tracking-widest transition-all duration-500 ${paymentMethod === "COD" ? "bg-amber-500 text-black shadow-[0_10px_25px_-5px_rgba(245,158,11,0.3)]" : "text-white/20 hover:text-white/40"}`}
        >
          CASH 🚚
        </button>
      </section>

      {/* 📦 ITEMS SUMMARY */}
      <div className="space-y-4 mb-10">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Review Bag</h3>
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">{items.length} Items</span>
        </div>
        {items.map((item) => (
          <div key={item.id} className="group bg-white/[0.03] border border-white/[0.05] p-4 rounded-[2.2rem] flex gap-5 items-center hover:bg-white/[0.06] transition-all">
            <div className="relative">
              <img src={item.image} className="w-20 h-20 rounded-[1.5rem] object-cover bg-black ring-1 ring-white/10" alt="product" />
              <span className="absolute -top-2 -right-2 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[#070b14]">
                {item.qty}
              </span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-black text-xs uppercase truncate tracking-wide text-white/90">{item.name}</p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">Unit Price</p>
                <p className="text-white font-black italic">₹{item.price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 💰 TOTAL BILL */}
      <section className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 p-8 rounded-[3rem] space-y-5 shadow-2xl relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[50px]" />
        <div className="flex justify-between text-[11px] font-black text-white/30 uppercase tracking-widest">
          <span>Subtotal</span>
          <span className="text-white/80">₹{itemsTotal}</span>
        </div>
        <div className="flex justify-between text-[11px] font-black text-white/30 uppercase tracking-widest">
          <span>Delivery</span>
          <span className={shipping === 0 ? "text-emerald-400" : "text-white/80"}>
            {shipping === 0 ? "FREE" : `₹${shipping}`}
          </span>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Grand Total</span>
          <div className="text-right">
             <span className="text-3xl font-black italic tracking-tighter bg-gradient-to-r from-white to-indigo-400 bg-clip-text text-transparent block">
              ₹{total}
            </span>
          </div>
        </div>
      </section>

      {/* 🚀 FIXED FOOTER BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-8 bg-gradient-to-t from-[#070b14] via-[#070b14]/95 to-transparent z-[100]">
        <button
          onClick={handlePayment}
          disabled={loading || items.length === 0}
          className="w-full max-w-md mx-auto relative group overflow-hidden py-6 rounded-[2.2rem] bg-indigo-600 font-black text-[11px] tracking-[0.3em] uppercase shadow-[0_20px_50px_-10px_rgba(79,70,229,0.5)] active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="w-5 h-5 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            `Confirm Order • ₹${total}`
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

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
  // 🔥 DATA INITIALIZATION
  // =========================
  useEffect(() => {
    let unsubscribe: any;
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

      // 2. Fetch Addresses (Sync with Profile)
      const addrSnap = await getDocs(collection(db, "addresses")); 
      const userAddresses: any[] = [];
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
        // ONLINE FLOW
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
            orderData // Bhej rahe hain taaki verify hone par save ho sake
          })
        });
        
        const data = await res.json();
        const cashfree = await load({ mode: "production" }); // Change to "sandbox" for testing
        
        localStorage.removeItem("buy-now"); // User redirect ho raha hai, toh clear kar sakte hain

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
    <div className="min-h-screen bg-[#0f172a] text-white p-4 pb-40 font-sans max-w-md mx-auto">
      
      {/* HEADER */}
      <header className="py-8 text-center">
        <h1 className="text-2xl font-black tracking-[0.2em] italic bg-gradient-to-r from-indigo-400 via-white to-cyan-400 bg-clip-text text-transparent uppercase">
          Finalize Order
        </h1>
      </header>

      {/* 📍 ADDRESS SECTION */}
      <section className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] mb-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-3xl" />
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Shipping To</h2>
          <button onClick={() => router.push("/profile")} className="text-[9px] font-black bg-white/10 px-4 py-2 rounded-full uppercase tracking-tighter border border-white/5 hover:bg-white/20">
            Change
          </button>
        </div>

        {address ? (
          <div className="space-y-2">
            <p className="text-lg font-black italic uppercase tracking-tight">{address.name}</p>
            <div className="text-sm text-white/60 space-y-1">
              <p className="leading-tight">{address.street}</p>
              {address.landmark && <p className="text-indigo-300/80 text-xs italic">Near {address.landmark}</p>}
              <p className="font-bold text-white">{address.city}, {address.state} - {address.zip}</p>
              <div className="pt-3 flex items-center gap-2 text-indigo-400 font-black text-xs">
                <span>📞 {address.phone}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center border-2 border-dashed border-white/10 rounded-[2rem]">
            <p className="text-white/30 text-xs mb-3 font-bold uppercase">No Address Selected</p>
            <button onClick={() => router.push("/profile")} className="bg-indigo-600 text-[10px] px-6 py-2 rounded-full font-black uppercase shadow-lg shadow-indigo-600/20">Add New</button>
          </div>
        )}
      </section>

      {/* 💳 PAYMENT TOGGLE */}
      <section className="bg-white/5 border border-white/10 p-1.5 rounded-[2rem] flex gap-2 mb-8">
        <button 
          onClick={() => setPaymentMethod("ONLINE")}
          className={`flex-1 py-4 rounded-[1.6rem] font-black text-xs tracking-widest transition-all ${paymentMethod === "ONLINE" ? "bg-white text-black shadow-xl" : "text-white/30 hover:bg-white/5"}`}
        >
          ONLINE 💳
        </button>
        <button 
          onClick={() => setPaymentMethod("COD")}
          className={`flex-1 py-4 rounded-[1.6rem] font-black text-xs tracking-widest transition-all ${paymentMethod === "COD" ? "bg-amber-500 text-black shadow-xl" : "text-white/30 hover:bg-white/5"}`}
        >
          CASH 🚚
        </button>
      </section>

      {/* 📦 ITEMS SUMMARY */}
      <div className="space-y-4 mb-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-4">Bag Content</h3>
        {items.map((item) => (
          <div key={item.id} className="bg-white/5 border border-white/5 p-4 rounded-[2rem] flex gap-4 items-center">
            <img src={item.image} className="w-16 h-16 rounded-2xl object-cover bg-black" alt="product" />
            <div className="flex-1">
              <p className="font-black text-[11px] uppercase truncate tracking-tight">{item.name}</p>
              <div className="flex justify-between items-end mt-1">
                <p className="text-[10px] font-bold text-white/40">Qty: {item.qty}</p>
                <p className="text-indigo-400 font-black italic">₹{item.price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 💰 TOTAL BILL */}
      <section className="bg-white/5 border border-white/10 p-7 rounded-[2.5rem] space-y-4">
        <div className="flex justify-between text-xs font-bold text-white/40 uppercase tracking-widest">
          <span>Subtotal</span>
          <span className="text-white">₹{itemsTotal}</span>
        </div>
        <div className="flex justify-between text-xs font-bold text-white/40 uppercase tracking-widest">
          <span>Delivery</span>
          <span className={shipping === 0 ? "text-green-400" : "text-white"}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
        </div>
        <div className="h-[1px] bg-white/10" />
        <div className="flex justify-between items-center">
          <span className="text-sm font-black uppercase tracking-tighter">Total Amount</span>
          <span className="text-2xl font-black italic tracking-tighter bg-gradient-to-l from-indigo-400 to-white bg-clip-text text-transparent">₹{total}</span>
        </div>
      </section>

      {/* 🚀 FIXED FOOTER BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/90 to-transparent z-[100]">
        <button
          onClick={handlePayment}
          disabled={loading || items.length === 0}
          className="w-full max-w-md mx-auto block py-6 rounded-[2rem] bg-indigo-600 font-black text-sm tracking-[0.2em] uppercase shadow-2xl shadow-indigo-600/40 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Verifying...
            </span>
          ) : (
            `Place Order • ₹${total}`
          )}
        </button>
      </div>
    </div>
  );
}

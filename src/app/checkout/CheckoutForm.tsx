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
  // 🔥 LOAD DATA
  // =========================
  useEffect(() => {
    let unsubscribe;
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

      // 📍 FETCH ADDRESSES
      const addrSnap = await getDocs(collection(db, "addresses")); 
      const userAddresses = [];
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
  // 💰 CALCULATION
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
        email: user.email, // Added Email
        items,
        itemsTotal,
        shipping,
        total,
        address, // Address object now includes landmark, street, phone etc.
        paymentMethod
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
        } else { alert("Order failed ❌"); }
      } else {
        const res = await fetch("/api/cashfree/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            customer: {
              uid: user.uid,
              name: address.name || user.displayName,
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
      <header className="py-6 text-center">
        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          CHECKOUT
        </h1>
      </header>

      <div className="max-w-md mx-auto space-y-6">
        
        {/* 📍 ADDRESS SECTION */}
        <section className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-[2.5rem] shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-300">Shipping Details</h2>
            <button onClick={() => router.push("/profile")} className="text-xs bg-indigo-500/20 px-4 py-1.5 rounded-full text-indigo-300 border border-indigo-500/30">
              Change
            </button>
          </div>

          {address ? (
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <p className="text-lg font-bold">{address.name || "Customer"}</p>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded uppercase font-bold tracking-tighter">Default</span>
              </div>
              
              <div className="space-y-1 text-white/70 text-sm">
                <p className="leading-tight">{address.street}</p>
                {address.landmark && (
                  <p className="text-indigo-300/80 italic">📍 Landmark: {address.landmark}</p>
                )}
                <p>{address.city}, {address.state} - <span className="text-white font-mono font-bold">{address.zip}</span></p>
                
                <div className="pt-2 flex flex-col gap-1 border-t border-white/5 mt-2">
                  <p className="flex items-center gap-2"><span className="opacity-50 text-xs">📞 Phone:</span> <span className="text-white font-medium">{address.phone}</span></p>
                  <p className="flex items-center gap-2"><span className="opacity-50 text-xs">✉️ Email:</span> <span className="text-white font-medium">{user?.email}</span></p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center border-2 border-dashed border-white/10 rounded-[2rem]">
              <p className="text-white/40 text-sm">No saved address ❌</p>
              <button onClick={() => router.push("/profile")} className="mt-3 text-indigo-400 font-bold text-xs underline">Add Address Now</button>
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
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Order Summary</h2>
          {items.map((item) => (
            <div key={item.id} className="bg-white/5 backdrop-blur-md border border-white/5 p-3 rounded-3xl flex gap-4 items-center">
              <img src={item.image} className="w-16 h-16 rounded-2xl object-cover bg-white/10" alt={item.name} />
              <div className="flex-1">
                <p className="font-bold text-sm line-clamp-1">{item.name}</p>
                <div className="flex justify-between items-center mt-1">
                   <p className="text-white/40 text-[10px]">Qty: {item.qty}</p>
                   <p className="text-indigo-400 font-black">₹{item.price}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* 💰 BILLING DETAILS */}
        <section className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-[2.5rem]">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-white/60">
              <span>Items Total</span>
              <span>₹{itemsTotal}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Shipping Charge</span>
              <span className={shipping === 0 ? "text-green-400 font-bold" : ""}>
                {shipping === 0 ? "FREE" : `₹${shipping}`}
              </span>
            </div>
            <div className="h-[1px] bg-white/10 my-2" />
            <div className="flex justify-between items-center text-xl font-black">
              <span>Grand Total</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-300">
                ₹{total}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* 🚀 FIXED BOTTOM ACTION */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/95 to-transparent z-50">
        <button
          onClick={handlePayment}
          disabled={loading || items.length === 0}
          className="w-full max-w-md mx-auto block py-5 rounded-[2rem] bg-indigo-600 font-black text-lg shadow-[0_10px_40px_rgba(79,70,229,0.5)] active:scale-95 transition-transform disabled:opacity-50 disabled:grayscale"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              PROCESSING...
            </span>
          ) : (
            `CONFIRM ORDER (₹${total})`
          )}
        </button>
      </div>
    </div>
  );
}

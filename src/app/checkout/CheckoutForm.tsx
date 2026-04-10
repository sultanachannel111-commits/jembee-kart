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
import { ShieldCheck, Truck, creditCard, Clock } from "lucide-react";

export default function CheckoutPage() {
  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");
  const [shippingConfig, setShippingConfig] = useState({ prepaid: 0, cod: 0, freeShippingAbove: 0 });

  const router = useRouter();

  useEffect(() => {
    let unsubscribe: any;
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.push("/login");
      setUser(u);

      // 1. 🔥 PRIORITY: BUY NOW (Product Page se aaya data)
      const buyNow = localStorage.getItem("buy-now");
      if (buyNow) {
        const parsed = JSON.parse(buyNow);
        setItems([{
          id: "buy-now",
          productId: parsed.productId,
          name: parsed.name,
          image: parsed.image,
          price: Number(parsed.price), // Ye discounted price hai
          basePrice: Number(parsed.basePrice || parsed.price),
          qty: Number(parsed.quantity) || 1
        }]);
      } else {
        // 2. 🛒 CART DATA (Firestore se)
        const ref = collection(db, "carts", u.uid, "items");
        unsubscribe = onSnapshot(ref, (snap) => {
          const data: any[] = [];
          snap.forEach(docSnap => {
            const d = docSnap.data();
            // Calculation logic consistent with cart page
            const sellPrice = d.price || 0; 
            data.push({
              id: docSnap.id,
              productId: d.productId,
              name: d.name,
              image: d.image,
              price: Number(sellPrice),
              qty: Number(d.quantity) || 1
            });
          });
          setItems(data);
        });
      }

      // 📍 ADDRESS FETCH
      const addrSnap = await getDocs(collection(db, "users", u.uid, "addresses"));
      const all: any[] = [];
      addrSnap.forEach(d => all.push({ id: d.id, ...d.data() }));
      setAddresses(all);
      setAddress(all.find(a => a.isDefault) || all[0] || null);

      // 🚚 SHIPPING CONFIG
      const shipSnap = await getDoc(doc(db, "config", "shipping"));
      if (shipSnap.exists()) setShippingConfig(shipSnap.data() as any);
    });

    return () => { unsubAuth(); if (unsubscribe) unsubscribe(); };
  }, []);

  // 💰 SMART CALCULATION ENGINE
  const itemsTotal = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
  
  let shippingCharge = paymentMethod === "COD" ? shippingConfig.cod : shippingConfig.prepaid;
  if (shippingConfig.freeShippingAbove > 0 && itemsTotal >= shippingConfig.freeShippingAbove) {
    shippingCharge = 0;
  }

  const grandTotal = itemsTotal + shippingCharge;

  const handlePayment = async () => {
    if (!address) return alert("Please select a delivery address!");
    setLoading(true);
    try {
      const orderData = { userId: user.uid, items, itemsTotal, shipping: shippingCharge, total: grandTotal, address, paymentMethod };

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
        }
      } else {
        const res = await fetch("/api/cashfree/create-order", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ amount: grandTotal, customer: { uid: user.uid, phone: address.phone } })
        });
        const data = await res.json();
        const cashfree = await load({ mode: "production" });
        await cashfree.checkout({ paymentSessionId: data.payment_session_id, redirectTarget: "_self" });
        localStorage.removeItem("buy-now");
      }
    } catch (e) { alert("Payment Failed!"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-40">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 p-6 rounded-b-[40px] shadow-lg">
        <h1 className="text-2xl font-bold text-white text-center">Secure Checkout</h1>
        <p className="text-blue-200 text-center text-xs mt-1">Complete your purchase safely</p>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-6 space-y-4">
        
        {/* 1. ADDRESS CARD */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Delivery To</span>
            <button onClick={() => router.push("/profile")} className="text-blue-600 text-xs font-bold">CHANGE</button>
          </div>
          {address ? (
            <div className="space-y-1">
              <p className="font-bold text-slate-800">{address.name} <span className="text-xs font-normal text-slate-400">| {address.phone}</span></p>
              <p className="text-sm text-slate-500">{address.address}, {address.city}, {address.pincode}</p>
            </div>
          ) : (
            <button onClick={() => router.push("/profile")} className="w-full py-3 border-2 border-dashed rounded-2xl text-slate-400 font-bold">+ Add Delivery Address</button>
          )}
        </div>

        {/* 2. PAYMENT METHODS (STABLE) */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">Payment Method</span>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setPaymentMethod("ONLINE")} className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${paymentMethod === "ONLINE" ? "border-blue-600 bg-blue-50" : "border-slate-50"}`}>
              <span className="text-xl">💳</span>
              <span className={`text-xs font-bold mt-1 ${paymentMethod === "ONLINE" ? "text-blue-600" : "text-slate-400"}`}>Online</span>
            </button>
            <button onClick={() => setPaymentMethod("COD")} className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${paymentMethod === "COD" ? "border-orange-600 bg-orange-50" : "border-slate-50"}`}>
              <span className="text-xl">🚚</span>
              <span className={`text-xs font-bold mt-1 ${paymentMethod === "COD" ? "text-orange-600" : "text-slate-400"}`}>Cash on Delivery</span>
            </button>
          </div>
        </div>

        {/* 3. ORDER SUMMARY (CORRECT CALCULATION) */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">Order Summary</span>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img src={item.image} className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</p>
                    <p className="text-[10px] text-slate-400">Qty: {item.qty}</p>
                  </div>
                </div>
                <p className="font-bold text-slate-800 text-sm">₹{item.price * item.qty}</p>
              </div>
            ))}
            
            <div className="pt-4 border-t border-dashed space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-bold text-slate-800">₹{itemsTotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Shipping</span>
                <span className={`font-bold ${shippingCharge === 0 ? "text-green-600" : "text-slate-800"}`}>
                  {shippingCharge === 0 ? "FREE" : `₹${shippingCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-lg pt-2">
                <span className="font-black text-slate-800">Grand Total</span>
                <span className="font-black text-blue-600">₹{grandTotal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. TRUST BADGES (RETAINED) */}
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="bg-green-50 p-3 rounded-2xl flex items-center gap-2 border border-green-100">
            <ShieldCheck className="text-green-600" size={18} />
            <span className="text-[10px] font-bold text-green-700">100% SECURE PAY</span>
          </div>
          <div className="bg-blue-50 p-3 rounded-2xl flex items-center gap-2 border border-blue-100">
            <Clock className="text-blue-600" size={18} />
            <span className="text-[10px] font-bold text-blue-700">7 DAYS RETURNS</span>
          </div>
        </div>
      </div>

      {/* STICKY ACTION BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-5 flex items-center justify-between z-50">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Total Payable</p>
          <p className="text-2xl font-black text-slate-900">₹{grandTotal}</p>
        </div>
        <button
          onClick={handlePayment}
          disabled={loading || items.length === 0}
          className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-200 active:scale-95 transition-all"
        >
          {loading ? "PROCESSING..." : "PLACE ORDER"}
        </button>
      </div>
    </div>
  );
}

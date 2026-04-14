"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, doc, getDoc, onSnapshot, query, where, writeBatch, increment } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { load } from "@cashfreepayments/cashfree-js";
import { ShieldCheck, RefreshCcw, ShoppingBag, ArrowLeft, Loader2, MapPin } from "lucide-react";

export default function CheckoutPage() {
  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");
  
  const [shippingConfig, setShippingConfig] = useState({ 
    prepaid: 0, 
    cod: 0, 
    freeShippingAbove: 0 
  });

  const router = useRouter();

  useEffect(() => {
    let unsubscribeCart: any;
    let unsubscribeAddr: any;

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.push("/login");
      setUser(u);

      // 🛒 1. Items Loading Logic
      const buyNowData = localStorage.getItem("buy-now");
      if (buyNowData) {
        try {
          const p = JSON.parse(buyNowData);
          setItems([{
            ...p,
            price: Number(p.price),
            basePrice: Number(p.basePrice || p.price),
            discount: Number(p.discount || 0),
            qty: Number(p.quantity || p.qty || 1)
          }]);
          setLoading(false);
        } catch (e) { console.error("Buy Now Error"); setLoading(false); }
      } else {
        const ref = collection(db, "carts", u.uid, "items");
        unsubscribeCart = onSnapshot(ref, (snap) => {
          const data: any[] = [];
          snap.forEach(docSnap => {
            const d = docSnap.data();
            data.push({ 
                id: docSnap.id, ...d, 
                price: Number(d.price), 
                basePrice: Number(d.basePrice), 
                qty: Number(d.qty || 1), 
                discount: Number(d.discount || 0) 
            });
          });
          setItems(data);
          setLoading(false);
        });
      }

      // 📍 2. Address Sync
      const addrRef = query(collection(db, "addresses"), where("userId", "==", u.uid));
      unsubscribeAddr = onSnapshot(addrRef, (snap) => {
        const all: any[] = [];
        snap.forEach(d => all.push({ id: d.id, ...d.data() }));
        setAddress(all.find(a => a.isDefault) || all[0] || null);
      });

      // 🚚 3. Shipping Config Fetch
      const shipSnap = await getDoc(doc(db, "config", "shipping"));
      if (shipSnap.exists()) setShippingConfig(shipSnap.data() as any);
    });

    return () => { 
        unsubAuth(); 
        if (unsubscribeCart) unsubscribeCart(); 
        if (unsubscribeAddr) unsubscribeAddr(); 
    };
  }, []);

  // 💰 Sadiya's 50% Net Profit Logic
  const calculateCommission = () => {
    return items.reduce((totalComm, item) => {
      const sellPrice = item.price;
      const basePrice = item.basePrice;
      const discount = item.discount || 0;
      const fixShippingForSeller = 40; 

      const discountedPrice = sellPrice - (sellPrice * (discount / 100));
      const netProfit = discountedPrice - basePrice - fixShippingForSeller;
      const itemComm = netProfit > 0 ? (netProfit * 0.50) : 0;
      
      return totalComm + (itemComm * item.qty);
    }, 0);
  };

  const itemsTotal = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const totalCommission = Math.round(calculateCommission());
  
  let adminShippingCharge = paymentMethod === "COD" ? shippingConfig.cod : shippingConfig.prepaid;
  if (shippingConfig.freeShippingAbove > 0 && itemsTotal >= shippingConfig.freeShippingAbove) {
    adminShippingCharge = 0;
  }
  const grandTotal = itemsTotal + adminShippingCharge;

  const handlePayment = async () => {
    if (!address) return alert("Pehle address set karein!");
    if (items.length === 0) return alert("Cart khali hai!");
    
    setOrderProcessing(true);
    try {
      const orderData = { 
        userId: user.uid, 
        items, 
        itemsTotal, 
        shippingCharge: adminShippingCharge,
        total: grandTotal, 
        commission: totalCommission,
        sellerRef: items[0]?.sellerId || "ADMIN", 
        address, 
        paymentMethod,
        orderStatus: "PLACED",
        createdAt: new Date().toISOString()
      };

      if (paymentMethod === "COD") {
        const res = await fetch("/api/orders/create", {
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
        // Cashfree Online Payment
        const res = await fetch("/api/cashfree/create-order", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ amount: grandTotal, customer: { uid: user.uid, phone: address.phone }, orderData })
        });
        const data = await res.json();
        const cashfree = await load({ mode: "production" });
        localStorage.removeItem("buy-now");
        await cashfree.checkout({ paymentSessionId: data.payment_session_id, redirectTarget: "_self" });
      }
    } catch (e) { alert("Order fail ho gaya!"); }
    setOrderProcessing(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-900" size={40} /></div>;

  return (
    <div className="min-h-screen pb-44" style={{ backgroundColor: 'var(--main-bg, #fdfdfd)' }}>
      {/* 📱 Custom App Header */}
      <div className="p-8 rounded-b-[45px] shadow-2xl relative" style={{ backgroundColor: 'var(--header-bg, #000000)' }}>
        <button onClick={() => router.back()} className="absolute left-6 top-9 text-white/80"><ArrowLeft size={24}/></button>
        <h1 className="text-xl font-black text-white text-center italic uppercase tracking-widest">Jembee Checkout</h1>
      </div>

      <div className="max-w-md mx-auto px-5 -mt-8 space-y-5">
        
        {/* 📍 Delivery Card */}
        <div className="bg-white p-6 rounded-[30px] shadow-xl border border-slate-50">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={16} className="text-indigo-600" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Address</span>
          </div>
          {address ? (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="font-extrabold text-slate-800 text-sm">{address.name}</p>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{address.street}, {address.city} - {address.pincode}</p>
              <p className="text-[11px] font-black text-indigo-600 mt-2 uppercase tracking-tighter">Contact: {address.phone}</p>
            </div>
          ) : (
            <button onClick={() => router.push("/profile")} className="w-full py-5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold transition-all hover:bg-slate-50">+ Add New Address</button>
          )}
        </div>

        {/* 💳 Payment Selector */}
        <div className="bg-white p-6 rounded-[30px] shadow-xl border border-slate-50">
          <span className="text-[10px] font-black text-slate-400 uppercase block mb-4">Select Payment Mode</span>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setPaymentMethod("ONLINE")} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${paymentMethod === "ONLINE" ? "border-indigo-600 bg-indigo-50 shadow-inner" : "border-slate-50 bg-slate-50"}`}>
              <span className="text-xl">💳</span>
              <span className="text-[10px] font-black uppercase">Online Pay</span>
            </button>
            <button onClick={() => setPaymentMethod("COD")} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${paymentMethod === "COD" ? "border-slate-900 bg-slate-100 shadow-inner" : "border-slate-50 bg-slate-50"}`}>
              <span className="text-xl">🚚</span>
              <span className="text-[10px] font-black uppercase">Cash on Del</span>
            </button>
          </div>
        </div>

        {/* 🛍️ Order Summary */}
        <div className="bg-white p-6 rounded-[30px] shadow-xl border border-slate-50">
          <div className="flex items-center gap-2 mb-5 border-b pb-4 border-slate-50">
            <ShoppingBag size={14} className="text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase">Item Summary</span>
          </div>
          
          <div className="space-y-4 mb-6 max-h-40 overflow-y-auto pr-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={item.image} className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                    <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">x{item.qty}</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 line-clamp-1">{item.name}</p>
                    <p className="text-[9px] text-green-600 font-black uppercase">{item.discount}% Jembee Discount</p>
                  </div>
                </div>
                <p className="font-black text-slate-800 text-sm">₹{item.price * item.qty}</p>
              </div>
            ))}
          </div>

          {/* Billing Breakdown */}
          <div className="pt-4 border-t-2 border-dashed border-slate-100 space-y-3">
            <div className="flex justify-between text-[11px] font-bold text-slate-400">
              <span>Subtotal Cost</span>
              <span className="text-slate-800">₹{itemsTotal}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-slate-400">
              <span>Admin Shipping</span>
              <span className={adminShippingCharge === 0 ? "text-green-600" : "text-slate-800"}>
                 {adminShippingCharge === 0 ? "FREE" : `+₹${adminShippingCharge}`}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-50">
              <span className="text-[11px] font-black uppercase text-slate-900">Total Payable</span>
              <span className="text-2xl font-black" style={{ color: 'var(--price-color, #1e293b)' }}>₹{grandTotal}</span>
            </div>
          </div>
        </div>

        {/* 🛡️ Trust Badges */}
        <div className="grid grid-cols-2 gap-4 pb-12">
          <div className="bg-green-50/50 p-4 rounded-3xl flex items-center gap-3 border border-green-100 text-green-700">
            <ShieldCheck size={18} />
            <span className="text-[9px] font-black uppercase tracking-widest">Secure Pay</span>
          </div>
          <div className="bg-indigo-50/50 p-4 rounded-3xl flex items-center gap-3 border border-indigo-100 text-indigo-700">
            <RefreshCcw size={18} />
            <span className="text-[9px] font-black uppercase tracking-widest">Easy Return</span>
          </div>
        </div>
      </div>

      {/* 🚀 Fixed Footer Action */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t p-6 flex items-center justify-between z-50 rounded-t-[40px] shadow-inner">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Amount to pay</span>
          <span className="text-2xl font-black text-slate-900 leading-none">₹{grandTotal}</span>
        </div>
        <button
          onClick={handlePayment}
          disabled={orderProcessing || items.length === 0}
          className="px-12 py-5 rounded-[25px] text-white font-black text-sm uppercase shadow-2xl active:scale-95 transition-all disabled:opacity-40"
          style={{ backgroundColor: 'var(--btn-color, #000000)' }}
        >
          {orderProcessing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              <span>Wait...</span>
            </div>
          ) : "Confirm Order"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, doc, getDoc, onSnapshot, addDoc, serverTimestamp, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { load } from "@cashfreepayments/cashfree-js";
import { ShieldCheck, RefreshCcw } from "lucide-react";

export default function CheckoutPage() {
  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");
  const [shippingConfig, setShippingConfig] = useState({ prepaid: 0, cod: 0, freeShippingAbove: 0 });

  const router = useRouter();

  useEffect(() => {
    let unsubscribeCart: any;
    let unsubscribeAddr: any;

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.push("/login");
      setUser(u);

      // 1. Items Logic
      const buyNow = localStorage.getItem("buy-now");
      if (buyNow) {
        const parsed = JSON.parse(buyNow);
        setItems([{
          id: "buy-now",
          productId: parsed.productId,
          name: parsed.name,
          image: parsed.image,
          price: Number(parsed.price),
          basePrice: Number(parsed.basePrice || parsed.price), 
          qty: Number(parsed.quantity) || 1
        }]);
      } else {
        const ref = collection(db, "carts", u.uid, "items");
        unsubscribeCart = onSnapshot(ref, (snap) => {
          const data: any[] = [];
          snap.forEach(docSnap => {
            const d = docSnap.data();
            data.push({
              id: docSnap.id,
              ...d,
              price: Number(d.price),
              basePrice: Number(d.basePrice || d.price),
              qty: Number(d.quantity || d.qty) || 1
            });
          });
          setItems(data);
        });
      }

      // 2. Address Logic (Real-time sync with Profile)
      const addrRef = query(collection(db, "addresses"), where("userId", "==", u.uid));
      unsubscribeAddr = onSnapshot(addrRef, (snap) => {
        const all: any[] = [];
        snap.forEach(d => all.push({ id: d.id, ...d.data() }));
        setAddress(all[0] || null);
      });

      const shipSnap = await getDoc(doc(db, "config", "shipping"));
      if (shipSnap.exists()) setShippingConfig(shipSnap.data() as any);
    });

    return () => { 
      unsubAuth(); 
      if (unsubscribeCart) unsubscribeCart(); 
      if (unsubscribeAddr) unsubscribeAddr(); 
    };
  }, []);

  // 💰 COMMISSION LOGIC (As per your requirement)
  const itemsTotal = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const totalBasePrice = items.reduce((sum, i) => sum + (i.basePrice * i.qty), 0);
  const profit = itemsTotal - totalBasePrice;
  const totalCommission = profit > 0 ? profit * 0.50 : 0;

  let shippingCharge = paymentMethod === "COD" ? shippingConfig.cod : shippingConfig.prepaid;
  if (shippingConfig.freeShippingAbove > 0 && itemsTotal >= shippingConfig.freeShippingAbove) {
    shippingCharge = 0;
  }
  const grandTotal = itemsTotal + shippingCharge;

  // 🔔 WHATSAPP ALERT LOGIC (Fixed for after-payment/COD)
  const sendAdminNotification = async (orderId: string, type: string) => {
    try {
      await addDoc(collection(db, "notifications"), {
        type: type,
        message: `🚀 Naya ${type === "COD_ORDER" ? "COD" : "Online"} Order!`,
        amount: grandTotal,
        orderId: orderId,
        read: false,
        createdAt: serverTimestamp(),
      });

      const adminMobile = "917061369212";
      const msg = `📦 *NEW ORDER CONFIRMED*
---------------------------
🆔 *Order ID:* #${orderId.slice(-8).toUpperCase()}
👤 *Customer:* ${address.name}
📞 *Contact:* ${address.phone}
💰 *Total Pay:* ₹${grandTotal}
💳 *Method:* ${type === "COD_ORDER" ? "Cash on Delivery" : "Online Paid"}

📍 *Address:* ${address.street}, ${address.city} (${address.zip})

🚀 _Dashboard check karein!_
*JembeeKart Notification*`;

      window.open(`https://wa.me/${adminMobile}?text=${encodeURIComponent(msg)}`, "_blank");
    } catch (err) { console.log(err); }
  };

  const handlePayment = async () => {
    if (!address) return alert("Pehle Profile mein address add karein!");
    setLoading(true);
    try {
      const orderData = { 
        userId: user.uid, 
        items, 
        itemsTotal, 
        shipping: shippingCharge, 
        total: grandTotal, 
        basePrice: totalBasePrice,
        commission: totalCommission,
        sellerRef: localStorage.getItem("affiliate") || "",
        address, 
        paymentMethod,
        orderStatus: "PLACED",
        createdAt: new Date().toISOString()
      };

      if (paymentMethod === "COD") {
        const res = await fetch("/api/orders/cod", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData)
        });
        const data = await res.json();
        if (data.success) {
          // COD Order ke baad notification
          await sendAdminNotification(data.orderId, "COD_ORDER");
          localStorage.removeItem("buy-now");
          router.replace(`/order-success/${data.orderId}`);
        }
      } else {
        const res = await fetch("/api/cashfree/create-order", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ amount: grandTotal, customer: { uid: user.uid, phone: address.phone }, orderData })
        });
        const data = await res.json();
        const cashfree = await load({ mode: "production" });
        
        // Online initiation ke baad hi notification (Aap isse success webhook par bhi shift kar sakte hain)
        await sendAdminNotification(data.cf_order_id || "ONLINE", "ONLINE_ORDER");
        
        await cashfree.checkout({ paymentSessionId: data.payment_session_id, redirectTarget: "_self" });
        localStorage.removeItem("buy-now");
      }
    } catch (e) { alert("Error!"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-40">
      <div className="bg-slate-900 p-6 rounded-b-[40px] shadow-lg">
        <h1 className="text-2xl font-black text-white text-center italic tracking-tighter uppercase">Secure Checkout</h1>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-6 space-y-4">
        {/* ADDRESS */}
        <div className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deliver to</span>
            <button onClick={() => router.push("/profile")} className="text-blue-600 text-[10px] font-black uppercase underline">Change</button>
          </div>
          {address ? (
            <div className="space-y-1">
              <p className="font-bold text-slate-800 text-sm">{address.name} <span className="opacity-30">|</span> {address.phone}</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {address.street}, {address.landmark && `${address.landmark}, `} {address.city} - {address.zip}
              </p>
            </div>
          ) : (
            <button onClick={() => router.push("/profile")} className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-xs font-bold">+ Add Address in Profile</button>
          )}
        </div>

        {/* PAYMENT */}
        <div className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Payment</span>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setPaymentMethod("ONLINE")} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${paymentMethod === "ONLINE" ? "border-blue-600 bg-blue-50" : "border-slate-50"}`}>
              <span className="text-lg">💳</span>
              <span className="text-[10px] font-black uppercase">Online</span>
            </button>
            <button onClick={() => setPaymentMethod("COD")} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${paymentMethod === "COD" ? "border-slate-900 bg-slate-50" : "border-slate-50"}`}>
              <span className="text-lg">🚚</span>
              <span className="text-[10px] font-black uppercase">Cash</span>
            </button>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100">
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img src={item.image} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Qty: {item.qty}</p>
                  </div>
                </div>
                <p className="font-black text-slate-800 text-sm">₹{item.price * item.qty}</p>
              </div>
            ))}
            <div className="pt-4 border-t border-dashed space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>Items Total</span>
                <span className="text-slate-800">₹{itemsTotal}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>Shipping</span>
                <span className={shippingCharge === 0 ? "text-green-600" : "text-slate-800"}>{shippingCharge === 0 ? "FREE" : `+₹${shippingCharge}`}</span>
              </div>
              <div className="flex justify-between items-end pt-2">
                <span className="text-xs font-black uppercase tracking-tighter">Grand Total</span>
                <span className="text-xl font-black text-blue-600 leading-none">₹{grandTotal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TRUST BADGES */}
        <div className="grid grid-cols-2 gap-3 pb-6">
          <div className="bg-green-50/50 p-3 rounded-2xl flex items-center gap-2 border border-green-100">
            <ShieldCheck className="text-green-600" size={14} />
            <span className="text-[9px] font-black text-green-700 uppercase">Secure Payment</span>
          </div>
          <div className="bg-blue-50/50 p-3 rounded-2xl flex items-center gap-2 border border-blue-100">
            <RefreshCcw className="text-blue-600" size={14} />
            <span className="text-[9px] font-black text-blue-700 uppercase">2 Days Exchange</span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-5 flex items-center justify-between z-50">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payable</span>
          <span className="text-2xl font-black text-slate-900 leading-none">₹{grandTotal}</span>
        </div>
        <button
          onClick={handlePayment}
          disabled={loading || items.length === 0}
          className="bg-slate-900 text-white px-10 py-4 rounded-[20px] font-black text-sm uppercase tracking-tighter shadow-xl active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? "Processing..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
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

      // 1. Items Loading Logic
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
        const cartRef = collection(db, "carts", u.uid, "items");
        unsubscribeCart = onSnapshot(cartRef, (snap) => {
          const data: any[] = [];
          snap.forEach(docSnap => {
            const d = docSnap.data();
            data.push({ id: docSnap.id, ...d, price: Number(d.price), qty: Number(d.quantity) || 1 });
          });
          setItems(data);
        });
      }

      // 2. ADDRESS SYNC (Profile Page ke hisaab se fixed)
      // Profile page "addresses" main collection mein save karta hai jahan userId filter hota hai
      const addrRef = query(collection(db, "addresses"), where("userId", "==", u.uid));
      
      unsubscribeAddr = onSnapshot(addrRef, (snap) => {
        const all: any[] = [];
        snap.forEach(d => all.push({ id: d.id, ...d.data() }));
        // Jo sabse naya address hai use dikhayenge
        setAddress(all[0] || null);
      });

      // 3. Shipping Config
      const shipSnap = await getDoc(doc(db, "config", "shipping"));
      if (shipSnap.exists()) setShippingConfig(shipSnap.data() as any);
    });

    return () => { 
      unsubAuth(); 
      if (unsubscribeCart) unsubscribeCart(); 
      if (unsubscribeAddr) unsubscribeAddr();
    };
  }, []);

  const itemsTotal = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const totalBasePrice = items.reduce((sum, i) => sum + (i.basePrice * i.qty), 0);
  const profit = itemsTotal - totalBasePrice;
  const totalCommission = profit > 0 ? profit * 0.50 : 0;

  let shippingCharge = paymentMethod === "COD" ? shippingConfig.cod : shippingConfig.prepaid;
  if (shippingConfig.freeShippingAbove > 0 && itemsTotal >= shippingConfig.freeShippingAbove) {
    shippingCharge = 0;
  }

  const grandTotal = itemsTotal + shippingCharge;

  const sendAdminNotification = async (orderId: string, type: string) => {
    const adminMobile = "917061369212";
    // Profile page fields: street, city, zip
    const message = 
`📦 *NEW ORDER CONFIRMED* 📦
---------------------------
🆔 *Order ID:* #${orderId.slice(-8).toUpperCase()}
👤 *Customer:* ${address.name}
📞 *Contact:* ${address.phone}
💰 *Total Pay:* ₹${grandTotal}
💳 *Method:* ${type === "COD" ? "Cash on Delivery" : "Online Paid"}

📍 *Address:* ${address.street}, ${address.city} (${address.zip})

🚀 _Dashboard check karein!_
*JembeeKart Notification*`;

    const waUrl = `https://wa.me/${adminMobile}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
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
        address: address, // Pura address object save hoga
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
          await sendAdminNotification(data.orderId, "COD");
          localStorage.removeItem("buy-now");
          router.replace(`/order-success/${data.orderId}`);
        } else {
          alert("Order failed!");
        }
      } else {
        const res = await fetch("/api/cashfree/create-order", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ amount: grandTotal, customer: { uid: user.uid, phone: address.phone }, orderData })
        });
        const data = await res.json();
        const cashfree = await load({ mode: "production" });
        
        await sendAdminNotification(data.cf_order_id || "ONLINE", "ONLINE");
        await cashfree.checkout({ paymentSessionId: data.payment_session_id, redirectTarget: "_self" });
        localStorage.removeItem("buy-now");
      }
    } catch (e) { 
      alert("Error!"); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-40">
      {/* UI Code Same Rahega... */}
      <div className="bg-slate-900 p-6 rounded-b-[40px] shadow-lg">
        <h1 className="text-2xl font-black text-white text-center italic tracking-tighter">SECURE CHECKOUT</h1>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-6 space-y-4">
        {/* ADDRESS DISPLAY */}
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
            <button onClick={() => router.push("/profile")} className="w-full py-4 text-xs font-bold text-slate-400 border-2 border-dashed rounded-2xl">
              + Add Address in Profile
            </button>
          )}
        </div>

        {/* PAYMENT & SUMMARY (Baki UI jo aapka tha wahi rahega) */}
        {/* ... (Rest of your UI) */}
      </div>
      
      {/* Footer code same rahega */}
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

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, collection, getDocs, deleteDoc, writeBatch, increment, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { CheckCircle, Package, ShoppingBag, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";

export default function OrderSuccessPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const processOrder = async () => {
      if (!id) return;

      try {
        // 1. Fetch Order from Firestore
        const orderRef = doc(db, "orders", id as string);
        const snap = await getDoc(orderRef);

        if (!snap.exists()) {
          setStatus("error");
          setErrorMessage("Order not found in our database.");
          return;
        }

        const orderData = snap.data();
        setOrder(orderData);

        // 2. Check if already processed (Double execution preventer)
        if (orderData.paymentStatus === "paid" || orderData.paymentMethod === "COD") {
          finalizeUI();
          return;
        }

        // 3. Online Payment Verification (Cashfree)
        const verifyRes = await fetch("/api/cashfree/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: id })
        });

        const verifyData = await verifyRes.json();

        if (!verifyData.success) {
          setStatus("error");
          setErrorMessage("Payment verification failed. Please contact support.");
          return;
        }

        // 4. Update Database (Atomic Operations)
        const batch = writeBatch(db);

        // A. Update Order Status
        batch.update(orderRef, {
          paymentStatus: "paid",
          orderStatus: "READY_FOR_MANUAL_QIKINK",
          processedAt: serverTimestamp()
        });

        // B. Update Stock (Inventory Management)
        orderData.items.forEach((item: any) => {
          const productRef = doc(db, "products", item.id);
          batch.update(productRef, {
            stock: increment(-item.qty)
          });
        });

        // C. Clear User Cart
        const user = auth.currentUser;
        if (user) {
          const cartSnap = await getDocs(collection(db, "carts", user.uid, "items"));
          cartSnap.docs.forEach((d) => {
            batch.delete(doc(db, "carts", user.uid, "items", d.id));
          });
        }

        await batch.commit();
        
        // 5. Admin Notification
        await addDoc(collection(db, "notifications"), {
          type: "NEW_ORDER",
          message: `💰 Payment Verified! Order #${(id as string).slice(-6)} (₹${orderData.total})`,
          orderId: id,
          createdAt: serverTimestamp()
        });

        localStorage.removeItem("buy-now");
        finalizeUI();

      } catch (err) {
        console.error(err);
        setStatus("error");
        setErrorMessage("Something went wrong while processing your order.");
      }
    };

    const finalizeUI = () => {
      setStatus("success");
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#000000', '#4f46e5', '#22c55e']
      });
    };

    processOrder();
  }, [id]);

  // --- UI STATES ---

  if (status === "verifying") {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-slate-900 mb-4" size={45} />
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 italic">Verifying Payment</h2>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50">
        <div className="bg-red-100 p-6 rounded-full mb-6">
          <AlertCircle className="text-red-600" size={40} />
        </div>
        <h1 className="text-xl font-black text-slate-900 uppercase italic">Oops! Problem Occurred</h1>
        <p className="text-xs text-slate-500 mt-2 text-center max-w-xs font-medium leading-relaxed">{errorMessage}</p>
        <button onClick={() => router.push("/")} className="mt-8 px-10 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Back to Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 pb-20">
      <div className="max-w-md w-full bg-white rounded-[45px] shadow-2xl overflow-hidden border border-white">
        
        {/* 🎉 TOP SECTION */}
        <div className="bg-black p-12 flex flex-col items-center text-white relative">
          <div className="bg-white/10 p-5 rounded-full mb-5">
            <CheckCircle size={50} className="text-green-400" />
          </div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">Order Success!</h1>
          <p className="text-[10px] font-bold uppercase opacity-50 tracking-[0.3em] mt-2">Jembee Kart Confirmed</p>
        </div>

        {/* 🧾 DETAILS SECTION */}
        <div className="p-8 space-y-8">
          <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-6">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Order ID</p>
              <p className="text-sm font-black text-slate-800 uppercase italic">#{(id as string).slice(-8)}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount Paid</p>
              <p className="text-2xl font-black text-slate-900">₹{order?.total}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-[30px] border border-slate-100 flex gap-4">
            <Package className="text-slate-400 shrink-0" size={20} />
            <div>
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">Processing your package</p>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                Aapka order successfully humein mil gaya hai. 24-48 hours ke andar dispatch details mil jayengi.
              </p>
            </div>
          </div>

          {/* 🔘 ACTION BUTTONS */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => router.push(`/orders`)} 
              className="w-full bg-indigo-600 text-white py-5 rounded-[25px] font-black text-[10px] uppercase shadow-xl hover:shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2 tracking-widest"
            >
              Track Order <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => router.push("/")} 
              className="w-full bg-white border-2 border-slate-100 py-5 rounded-[25px] font-black text-[10px] uppercase text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center gap-2 tracking-widest"
            >
              <ShoppingBag size={14} /> Shop More
            </button>
          </div>
        </div>
      </div>
      
      <p className="mt-10 text-[9px] font-black text-slate-300 uppercase tracking-[6px] italic">Thank you for choosing Jembee</p>
    </div>
  );
}

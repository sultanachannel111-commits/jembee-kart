"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ShoppingBag, Package, Clock, CheckCircle2, Truck, ArrowLeft, Loader2, AlertCircle, X, MessageSquare } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showHelp, setShowHelp] = useState(false);
  
  // States for Help Form
  const [reason, setReason] = useState("");
  const [issue, setIssue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const unsubscribeOrders = onSnapshot(q, (snap) => {
        const arr: any[] = [];
        snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
        setOrders(arr);
        setLoading(false);
      }, (error) => {
        console.error("Firestore Error:", error);
        setLoading(false);
      });

      return () => unsubscribeOrders();
    });

    return () => unsubAuth();
  }, [router]);

  const getDeliveryDate = (order: any) => {
    if (!order.createdAt) return "TBD";
    const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
    date.setDate(date.getDate() + 5);
    return date.toDateString();
  };

  // ✅ FIX: Reset states when closing modal
  const closeHelpModal = () => {
    setShowHelp(false);
    setSelectedOrder(null);
    setReason("");
    setIssue("");
    setIsProcessing(false);
  };

  // ✅ FIX: Order Cancellation Logic
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    
    // Safety check for status
    const status = selectedOrder.orderStatus;
    if (status !== "PLACED" && status !== "PENDING") {
      alert("Order process ya ship ho chuka hai, ab cancel nahi ho sakta ❌");
      return;
    }

    if (confirm("Kya aap sach mein order cancel karna chahte hain?")) {
      setIsProcessing(true);
      try {
        await updateDoc(doc(db, "orders", selectedOrder.id), { 
          orderStatus: "CANCELLED",
          cancelledAt: serverTimestamp() 
        });
        alert("Order Cancelled Successfully ✅");
        closeHelpModal();
      } catch (err) {
        alert("Cancellation failed. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // ✅ FIX: Return Request with State Reset
  const handleReturnRequest = async () => {
    if (!reason) return alert("Please select a reason ❌");
    
    setIsProcessing(true);
    try {
      await addDoc(collection(db, "returns"), {
        orderId: selectedOrder.id,
        userId: selectedOrder.userId,
        reason,
        issue,
        status: "REQUESTED",
        createdAt: serverTimestamp()
      });

      alert("Return Request Sent Successfully! Hum aapse jaldi sampark karenge. ✅");
      closeHelpModal();
    } catch (err) {
      alert("Request failed. Please check your internet.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-slate-900" size={32} />
      <p className="text-[10px] font-black uppercase mt-4 tracking-widest text-slate-400">Syncing Orders...</p>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 bg-slate-50">
      {/* 📱 HEADER */}
      <div className="p-8 rounded-b-[45px] shadow-2xl relative bg-black">
        <button onClick={() => router.push("/")} className="absolute left-6 top-9 text-white/70">
          <ArrowLeft size={24}/>
        </button>
        <h1 className="text-xl font-black text-white text-center italic uppercase tracking-widest">Order History</h1>
      </div>

      <div className="max-w-md mx-auto px-5 -mt-8 space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-[40px] shadow-xl text-center border border-slate-50">
            <ShoppingBag className="text-slate-200 mx-auto mb-6" size={60} />
            <h2 className="text-lg font-black text-slate-800 uppercase italic">No Orders Yet</h2>
            <button onClick={() => router.push("/")} className="mt-8 w-full py-5 bg-black text-white rounded-[25px] font-black text-xs uppercase shadow-2xl">Start Shopping</button>
          </div>
        ) : (
          orders.map((o) => {
            const total = Number(o.total) || (Number(o.itemsTotal || 0) + Number(o.shippingCharge || 0));
            
            return (
              <div key={o.id} className="bg-white p-5 rounded-[35px] shadow-lg border border-slate-50 overflow-hidden transition-transform active:scale-[0.98]">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                    o.orderStatus === 'CANCELLED' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {o.orderStatus || "PENDING"}
                  </div>
                  <p className="text-[9px] font-bold text-slate-300 uppercase">#{o.id.slice(-8)}</p>
                </div>

                <div className="flex gap-4">
                  <img src={o.items?.[0]?.image} alt="" className="w-20 h-20 rounded-2xl object-cover shadow-sm border border-slate-50" />
                  <div className="flex-1">
                    <p className="text-xs font-black text-slate-800 line-clamp-1 italic uppercase">{o.items?.[0]?.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Qty: {o.items?.[0]?.qty} | Total: ₹{total}</p>
                    {o.orderStatus !== 'CANCELLED' && (
                      <div className="flex items-center gap-1 mt-2 text-[10px] font-black text-indigo-600 uppercase">
                        <Truck size={12} /> {getDeliveryDate(o)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <button 
                    disabled={o.orderStatus === 'CANCELLED'}
                    onClick={() => router.push(`/track/${o.id}`)}
                    className="py-3 bg-slate-900 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg disabled:opacity-50 disabled:bg-slate-200"
                  >
                    Track Order
                  </button>
                  <button 
                    onClick={() => { setSelectedOrder(o); setShowHelp(true); }}
                    className="py-3 bg-white border border-slate-100 text-slate-400 rounded-2xl font-black text-[9px] uppercase tracking-widest"
                  >
                    Help & Return
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 🔥 HELP & RETURN MODAL (FIXED) */}
      {showHelp && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[40px] w-full max-w-md shadow-2xl relative animate-in fade-in slide-in-from-bottom-10 max-h-[90vh] overflow-y-auto">
            <button onClick={closeHelpModal} className="absolute right-6 top-6 text-slate-300 hover:text-slate-900"><X size={24}/></button>
            
            <h2 className="text-xl font-black text-slate-900 uppercase italic mb-2 tracking-tight">Need Help?</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-6 tracking-widest">Order #{(selectedOrder.id).slice(-8)}</p>

            <div className="space-y-4">
              {/* CANCEL SECTION */}
              {selectedOrder.orderStatus === "PLACED" || selectedOrder.orderStatus === "PENDING" ? (
                <button
                  disabled={isProcessing}
                  onClick={handleCancelOrder}
                  className="w-full flex items-center justify-between p-5 bg-red-50 text-red-600 rounded-3xl border border-red-100 active:scale-95 transition-all disabled:opacity-50"
                >
                  <span className="text-xs font-black uppercase">{isProcessing ? "Processing..." : "Cancel Order"}</span>
                  <AlertCircle size={18} />
                </button>
              ) : (
                <div className="p-4 bg-slate-50 rounded-3xl text-[9px] font-bold text-slate-400 uppercase text-center border border-slate-100">
                  This order cannot be cancelled anymore.
                </div>
              )}

              {/* RETURN SECTION */}
              <div className="p-1 bg-slate-50 rounded-[30px] border border-slate-100">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare size={14} className="text-slate-400" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Return Request</h3>
                  </div>
                  
                  <select
                    disabled={isProcessing}
                    className="w-full bg-white border border-slate-100 p-4 rounded-2xl text-xs font-bold outline-none mb-3 shadow-sm focus:border-indigo-300 transition-colors"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  >
                    <option value="">Select Reason</option>
                    <option>Wrong Product Sent</option>
                    <option>Damaged in Transit</option>
                    <option>Size/Fitting Issue</option>
                    <option>Quality not as expected</option>
                  </select>

                  <textarea
                    disabled={isProcessing}
                    placeholder="Briefly describe the issue..."
                    className="w-full bg-white border border-slate-100 p-4 rounded-2xl text-xs font-bold outline-none h-24 resize-none shadow-sm focus:border-indigo-300 transition-colors"
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                  />

                  <button
                    disabled={isProcessing}
                    onClick={handleReturnRequest}
                    className="w-full mt-4 bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {isProcessing ? "Submitting..." : "Submit Return Request"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

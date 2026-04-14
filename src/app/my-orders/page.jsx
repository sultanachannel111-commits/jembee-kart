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
import { ShoppingBag, Package, Clock, CheckCircle2, Truck, ArrowLeft, Loader2, AlertCircle, X, MessageSquare, ChevronRight } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  
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
        const arr = [];
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

  const getDeliveryDate = (order) => {
    if (!order.createdAt) return "TBD";
    const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
    date.setDate(date.getDate() + 5);
    return date.toDateString();
  };

  const closeHelpModal = () => {
    setShowHelp(false);
    setSelectedOrder(null);
    setReason("");
    setIssue("");
    setIsProcessing(false);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
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
        alert("Cancellation failed.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleReturnRequest = async () => {
    if (!reason || !issue) return alert("Please select a reason and describe the issue ❌");
    
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
      alert("Return Request Sent! ✅");
      closeHelpModal();
    } catch (err) {
      alert("Request failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-slate-900" size={32} />
      <p className="text-[10px] font-black uppercase mt-4 tracking-widest text-slate-400">Syncing Your Orders...</p>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 bg-slate-50">
      <div className="p-8 rounded-b-[45px] shadow-2xl relative bg-black">
        <button onClick={() => router.push("/")} className="absolute left-6 top-9 text-white/70">
          <ArrowLeft size={24}/>
        </button>
        <h1 className="text-xl font-black text-white text-center italic uppercase tracking-widest">Order History</h1>
      </div>

      <div className="max-w-md mx-auto px-5 -mt-8 space-y-6">
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
              <div key={o.id} className="bg-white p-6 rounded-[35px] shadow-lg border border-slate-50 overflow-hidden">
                <div className="flex justify-between items-start mb-5">
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                    o.orderStatus === 'CANCELLED' ? 'bg-red-50 text-red-500' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {o.orderStatus || "PENDING"}
                  </div>
                  <p className="text-[9px] font-bold text-slate-300 uppercase">#{o.id.slice(-8)}</p>
                </div>

                {/* --- Multiple Items Loop Fix --- */}
                <div className="space-y-4">
                  {o.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <img src={item.image} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-slate-100" />
                      <div className="flex-1">
                        <p className="text-xs font-black text-slate-800 line-clamp-1 italic uppercase">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">Qty: {item.qty} | Price: ₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-50 flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase">Total Amount</p>
                    <p className="text-lg font-black text-slate-900">₹{total}</p>
                  </div>
                  {o.orderStatus !== 'CANCELLED' && (
                    <div className="flex items-center gap-1 text-[9px] font-black text-indigo-600 uppercase">
                      <Truck size={12} /> Est: {getDeliveryDate(o)}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <button 
                    disabled={o.orderStatus === 'CANCELLED'}
                    onClick={() => router.push(`/track/${o.id}`)}
                    className="py-3 bg-slate-900 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg disabled:opacity-50"
                  >
                    Track Order
                  </button>
                  <button 
                    onClick={() => { setSelectedOrder(o); setShowHelp(true); }}
                    className="py-3 bg-white border border-slate-100 text-slate-400 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-50"
                  >
                    Help & Return
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* HELP MODAL */}
      {showHelp && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[40px] w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={closeHelpModal} className="absolute right-6 top-6 text-slate-300"><X size={24}/></button>
            <h2 className="text-xl font-black text-slate-900 uppercase italic mb-2">Need Help?</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-6">Order #{(selectedOrder.id).slice(-8)}</p>

            <div className="space-y-4">
              {/* Cancel Button Logic */}
              {(selectedOrder.orderStatus === "PLACED" || selectedOrder.orderStatus === "PENDING") ? (
                <button disabled={isProcessing} onClick={handleCancelOrder} className="w-full flex items-center justify-between p-5 bg-red-50 text-red-600 rounded-3xl border border-red-100">
                  <span className="text-xs font-black uppercase">{isProcessing ? "Processing..." : "Cancel Order"}</span>
                  <AlertCircle size={18} />
                </button>
              ) : (
                <div className="p-4 bg-slate-50 rounded-3xl text-[9px] font-bold text-slate-400 uppercase text-center">Cannot be cancelled anymore.</div>
              )}

              {/* Return Section */}
              <div className="p-1 bg-slate-50 rounded-[30px] border border-slate-100">
                <div className="p-4">
                  <select disabled={isProcessing} className="w-full bg-white border border-slate-100 p-4 rounded-2xl text-xs font-bold mb-3" value={reason} onChange={(e) => setReason(e.target.value)}>
                    <option value="">Select Reason</option>
                    <option>Wrong Product Sent</option>
                    <option>Damaged in Transit</option>
                    <option>Size/Fitting Issue</option>
                  </select>
                  <textarea disabled={isProcessing} placeholder="Describe the issue..." className="w-full bg-white border border-slate-100 p-4 rounded-2xl text-xs font-bold h-24 resize-none mb-3" value={issue} onChange={(e) => setIssue(e.target.value)} />
                  <button disabled={isProcessing} onClick={handleReturnRequest} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase">
                    {isProcessing ? "Submitting..." : "Submit Request"}
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

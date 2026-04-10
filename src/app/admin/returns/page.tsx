"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  query
} from "firebase/firestore";

export default function AdminReturns() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReturns = async () => {
    setLoading(true);
    try {
      // Returns collection se saari requests fetch karna
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snap = await getDocs(collection(db, "orders"));
      
      // Sirf wahi orders filter karna jinka status 'Return Requested' hai
      const returnRequests = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((order: any) => order.status === "Return Requested");
        
      setReturns(returnRequests);
    } catch (err) {
      console.error("Error loading returns:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReturns();
  }, []);

  // Action Handler (Approve/Reject/Pickup/etc)
  const handleAction = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
      
      alert(`Order updated to: ${newStatus}`);
      loadReturns(); // List refresh karein
    } catch (err) {
      alert("Action failed!");
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading Requests...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800">
          Return / Exchange Panel 📦
        </h1>
        <button onClick={loadReturns} className="text-xs bg-gray-100 px-3 py-1 rounded-lg">Refresh</button>
      </div>

      {returns.length === 0 ? (
        <p className="text-gray-400 text-center py-20 border-2 border-dashed rounded-3xl">No pending return requests.</p>
      ) : (
        <div className="grid gap-4">
          {returns.map(r => (
            <div key={r.id} className="bg-white border border-gray-100 p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                  <p className="font-mono text-sm">#{r.id.slice(0, 8)}</p>
                </div>
                <span className="bg-orange-50 text-orange-600 text-[10px] px-3 py-1 rounded-full font-black uppercase">
                  {r.status}
                </span>
              </div>

              <div className="mb-6 bg-gray-50 p-4 rounded-2xl">
                <p className="text-xs font-bold text-slate-500 mb-1 uppercase">Reason for Return:</p>
                <p className="text-slate-800 font-medium italic">"{r.returnReason || 'No reason provided'}"</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {r.status === "Return Requested" && (
                  <>
                    <button 
                      onClick={() => handleAction(r.id, "Return Approved")}
                      className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-xs uppercase hover:bg-green-600 transition-colors"
                    >
                      Approve ✅
                    </button>
                    <button 
                      onClick={() => handleAction(r.id, "Return Rejected")}
                      className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold text-xs uppercase hover:bg-red-600 transition-colors"
                    >
                      Reject ❌
                    </button>
                  </>
                )}

                {r.status === "Return Approved" && (
                  <button 
                    onClick={() => handleAction(r.id, "Pickup Scheduled")}
                    className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold text-xs uppercase"
                  >
                    Schedule Pickup 🚚
                  </button>
                )}

                {r.status === "Pickup Scheduled" && (
                  <button 
                    onClick={() => handleAction(r.id, "Return Received")}
                    className="w-full bg-black text-white py-3 rounded-xl font-bold text-xs uppercase"
                  >
                    Mark as Received 📥
                  </button>
                )}
                
                {r.status === "Return Received" && (
                  <button 
                    onClick={() => handleAction(r.id, "Exchange Shipped")}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-xs uppercase"
                  >
                    Ship Exchange 🎁
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function QikinkPage() {
  const [order, setOrder] = useState({
    sku: "",
    size: "M",
    qty: 1,
    customerName: "",
    address: "",
    pincode: "",
    phone: "",
    city: ""
  });
  
  const [loading, setLoading] = useState(false);

  const createOrder = async () => {
    // Basic Validation
    if (!order.sku || !order.phone || !order.pincode) {
      return toast.error("Please fill all required fields!");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/qikink-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });

      const data = await res.json();

      if (data.success) {
        toast.success("🚀 Order Sent To Qikink!");
        // Form clear kar dete hain success par
        setOrder({ sku: "", size: "M", qty: 1, customerName: "", address: "", pincode: "", phone: "", city: "" });
      } else {
        toast.error(data.message || "Order Failed ❌");
      }
    } catch (err) {
      toast.error("Server Error ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    setOrder({ ...order, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black italic tracking-tighter text-slate-900">
            QIKINK <span className="text-purple-600">MANUAL PUSH</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Push orders directly to print</p>
        </header>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
          
          {/* PRODUCT DETAILS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Product SKU</label>
              <input name="sku" value={order.sku} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 mt-1 focus:ring-2 ring-purple-500" placeholder="TSHIRT-BLK-001" />
            </div>
            <div className="col-span-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Size</label>
              <select name="size" value={order.size} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 mt-1">
                {["S", "M", "L", "XL", "XXL"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* CUSTOMER DETAILS */}
          <div className="space-y-4 pt-4 border-t border-dashed">
            <h3 className="text-xs font-black text-purple-600 uppercase tracking-widest">Shipping Info</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <input name="customerName" value={order.customerName} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3" placeholder="Full Customer Name" />
              </div>
              <div className="col-span-1">
                <input name="phone" value={order.phone} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3" placeholder="Phone Number" />
              </div>
              <div className="col-span-1">
                <input name="pincode" value={order.pincode} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3" placeholder="Pincode" />
              </div>
              <div className="col-span-2">
                <textarea name="address" value={order.address} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3" placeholder="Full Delivery Address" rows={3} />
              </div>
            </div>
          </div>

          <button
            onClick={createOrder}
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-3xl font-black text-sm uppercase tracking-tighter shadow-xl shadow-slate-200 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Syncing with Qikink..." : "Send Order To Qikink 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
}

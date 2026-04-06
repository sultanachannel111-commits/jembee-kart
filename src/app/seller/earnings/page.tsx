"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

export default function SellerEarnings(){

  const [orders,setOrders] = useState(0);
  const [revenue,setRevenue] = useState(0);

  const [available,setAvailable] = useState(0);
  const [pending,setPending] = useState(0);

  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    const loadEarnings = async()=>{

      const user = auth.currentUser;
      if(!user) return;

      const q = query(
        collection(db,"orders"),
        where("sellerRef","==",user.uid)
      );

      const snap = await getDocs(q);

      let totalRevenue = 0;
      let availableAmount = 0;
      let pendingAmount = 0;

      snap.forEach((doc)=>{

        const data:any = doc.data();

        const total = Number(data.total) || 0;
        const commission = Number(data.commission) || 0;

        // 🔥 FIX (IMPORTANT)
        const status = data.orderStatus || data.status || "PENDING";

        totalRevenue += total;

        // ✅ AVAILABLE (ONLY DELIVERED)
        if(status === "DELIVERED"){
          availableAmount += commission;
        }

        // ✅ PENDING (ALL OTHER STATES)
        else if(
          status === "PLACED" ||
          status === "Processing" ||
          status === "Shipped" ||
          status === "PENDING"
        ){
          pendingAmount += commission;
        }

      });

      setOrders(snap.size);
      setRevenue(totalRevenue);
      setAvailable(availableAmount);
      setPending(pendingAmount);

      setLoading(false);

    };

    loadEarnings();

  },[]);

  if(loading){
    return(
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading earnings...
      </div>
    );
  }

  return(

    <div className="min-h-screen bg-gradient-to-br from-purple-800 via-pink-600 to-orange-400 p-6 text-white">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-8">
        Seller Earnings 💰
      </h1>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* ORDERS */}
        <div className="bg-white/20 backdrop-blur-2xl p-6 rounded-2xl shadow-xl border border-white/30">
          <p className="text-sm opacity-80">
            Total Orders
          </p>
          <h2 className="text-3xl font-bold">
            {orders}
          </h2>
        </div>

        {/* SALES */}
        <div className="bg-white/20 backdrop-blur-2xl p-6 rounded-2xl shadow-xl border border-white/30">
          <p className="text-sm opacity-80">
            Total Sales
          </p>
          <h2 className="text-3xl font-bold">
            ₹{revenue}
          </h2>
        </div>

        {/* AVAILABLE */}
        <div className="bg-white/20 backdrop-blur-2xl p-6 rounded-2xl shadow-xl border border-white/30">
          <p className="text-sm opacity-80">
            Available Balance ✅
          </p>
          <h2 className="text-3xl font-bold text-green-300">
            ₹{available}
          </h2>
        </div>

        {/* PENDING */}
        <div className="bg-white/20 backdrop-blur-2xl p-6 rounded-2xl shadow-xl border border-white/30">
          <p className="text-sm opacity-80">
            Pending Earnings ⏳
          </p>
          <h2 className="text-3xl font-bold text-yellow-300">
            ₹{pending}
          </h2>
        </div>

      </div>

    </div>

  );

}

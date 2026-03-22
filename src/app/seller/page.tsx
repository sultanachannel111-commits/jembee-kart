"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function SellerDashboard() {

  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [totalEarning, setTotalEarning] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  // 🔐 AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsub();
  }, []);

  // 🔥 FETCH SELLER ORDERS
  useEffect(() => {

    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("sellerId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {

      let data: any[] = [];
      let earning = 0;

      snap.forEach(doc => {
        const d = doc.data();

        data.push({ id: doc.id, ...d });

        earning += d.commission || 0;
      });

      setOrders(data);
      setTotalOrders(data.length);
      setTotalEarning(earning);
    });

    return () => unsub();

  }, [user]);

  if (!user) {
    return <div className="p-5">Login required ❌</div>;
  }

  return (
    <div className="p-4 space-y-4">

      {/* 🔥 HEADER */}
      <h1 className="text-2xl font-bold">
        Seller Dashboard 💰
      </h1>

      {/* 💰 STATS */}
      <div className="grid grid-cols-2 gap-3">

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Total Earning</p>
          <h2 className="text-xl font-bold text-green-600">
            ₹{totalEarning}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Total Orders</p>
          <h2 className="text-xl font-bold">
            {totalOrders}
          </h2>
        </div>

      </div>

      {/* 📦 ORDER LIST */}
      <div className="bg-white p-4 rounded-xl shadow">

        <h2 className="font-bold mb-3">
          Orders History
        </h2>

        {orders.length === 0 && (
          <p className="text-sm text-gray-500">
            No orders yet
          </p>
        )}

        <div className="space-y-3">

          {orders.map((o) => (

            <div
              key={o.id}
              className="border p-3 rounded-lg"
            >

              <p className="text-sm font-medium">
                Product ID: {o.productId}
              </p>

              <p className="text-xs text-gray-500">
                Sell: ₹{o.sellPrice} | Base: ₹{o.basePrice}
              </p>

              <p className="text-green-600 font-bold">
                Commission: ₹{o.commission}
              </p>

              <p className="text-xs text-gray-400">
                Status: {o.status}
              </p>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

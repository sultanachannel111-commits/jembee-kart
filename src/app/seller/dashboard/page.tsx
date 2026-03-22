"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function SellerDashboard() {

  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalEarning: 0,
    totalCommission: 0
  });

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

    const fetchOrders = async () => {

      const q = query(
        collection(db, "orders"),
        where("sellerId", "==", user.uid)
      );

      const snap = await getDocs(q);

      let data: any[] = [];
      let total = 0;
      let commission = 0;

      snap.forEach(doc => {
        const d = doc.data();

        data.push({ id: doc.id, ...d });

        total += d.sellPrice || 0;
        commission += d.commission || 0;
      });

      setOrders(data);

      setStats({
        totalOrders: data.length,
        totalEarning: total,
        totalCommission: commission
      });

      setLoading(false);
    };

    fetchOrders();

  }, [user]);

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div className="p-4 space-y-4">

      {/* 🔥 HEADER */}
      <h1 className="text-2xl font-bold">
        Seller Dashboard 📊
      </h1>

      {/* 🔥 STATS */}
      <div className="grid grid-cols-3 gap-3">

        <div className="bg-white p-3 rounded-xl shadow text-center">
          <p className="text-sm text-gray-500">Orders</p>
          <p className="text-lg font-bold">
            {stats.totalOrders}
          </p>
        </div>

        <div className="bg-white p-3 rounded-xl shadow text-center">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-lg font-bold text-blue-600">
            ₹{stats.totalEarning}
          </p>
        </div>

        <div className="bg-white p-3 rounded-xl shadow text-center">
          <p className="text-sm text-gray-500">Commission</p>
          <p className="text-lg font-bold text-green-600">
            ₹{stats.totalCommission}
          </p>
        </div>

      </div>

      {/* 🔥 ORDERS LIST */}
      <div className="bg-white p-4 rounded-xl shadow">

        <h2 className="font-semibold mb-3">
          Recent Orders
        </h2>

        <div className="space-y-2">

          {orders.map((o) => (

            <div
              key={o.id}
              className="flex justify-between border-b pb-2 text-sm"
            >

              <div>
                <p>Product ID: {o.productId}</p>
                <p className="text-gray-500 text-xs">
                  {o.paymentMethod}
                </p>
              </div>

              <div className="text-right">
                <p className="text-blue-600">
                  ₹{o.sellPrice}
                </p>
                <p className="text-green-600 text-xs">
                  +₹{o.commission}
                </p>
              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

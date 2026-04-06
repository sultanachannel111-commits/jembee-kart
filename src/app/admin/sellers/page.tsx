"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  setDoc,
  increment
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SellersPage() {

  const [sellers, setSellers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  // ================= LOAD ALL =================
  async function loadAll() {

    // USERS
    const userSnap = await getDocs(collection(db, "users"));

    const sellerList = userSnap.docs
      .map(d => ({
        id: d.id,
        ...d.data()
      }))
      .filter((u: any) => u.role === "seller");

    setSellers(sellerList);

    // ORDERS
    const orderSnap = await getDocs(collection(db, "orders"));

    const orderList = orderSnap.docs.map(d => d.data());

    setOrders(orderList);
  }

  // ================= TOGGLE SELLER =================
  async function toggleSeller(id: string, active: boolean) {
    setLoading(true);

    await updateDoc(doc(db, "users", id), {
      active: !active
    });

    await loadAll();
    setLoading(false);
  }

  // ================= CALCULATE DATA =================
  const sellerStats: any = {};

  orders.forEach((o: any) => {

    if (!o.sellerRef) return;

    if (!sellerStats[o.sellerRef]) {
      sellerStats[o.sellerRef] = {
        orders: 0,
        commission: 0
      };
    }

    sellerStats[o.sellerRef].orders += 1;
    sellerStats[o.sellerRef].commission += o.commission || 0;

  });

  // ================= PAYOUT =================
  async function markPaid(sellerId: string, amount: number) {

    if (!confirm("Mark payout as paid?")) return;

    await setDoc(doc(db, "payouts", sellerId), {
      sellerId,
      amount,
      paidAt: new Date(),
    });

    alert("✅ Payout marked as paid");
  }

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 via-pink-600 to-orange-400 p-6 text-white">

      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          Seller Dashboard 💼
        </h1>
        <p className="opacity-80">
          Manage sellers, earnings & payouts
        </p>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {sellers.map((s) => {

          const stats = sellerStats[s.id] || {
            orders: 0,
            commission: 0
          };

          return (
            <div
              key={s.id}
              className="backdrop-blur-2xl bg-white/20 border border-white/30 rounded-3xl p-6 shadow-xl space-y-4"
            >

              {/* NAME */}
              <div>
                <p className="text-xs opacity-70">Seller</p>
                <p className="text-lg font-bold">
                  {s.name || "Unknown"}
                </p>
              </div>

              {/* EMAIL */}
              <div>
                <p className="text-xs opacity-70">Email</p>
                <p className="text-sm">{s.email}</p>
              </div>

              {/* STATUS */}
              <span className={`px-3 py-1 rounded-full text-xs ${
                s.active
                  ? "bg-green-400/20 text-green-200"
                  : "bg-red-400/20 text-red-200"
              }`}>
                {s.active ? "Active" : "Blocked"}
              </span>

              {/* STATS */}
              <div className="space-y-1 text-sm">

                <p>📦 Orders: {stats.orders}</p>

                <p className="text-green-300 font-semibold">
                  💰 Commission: ₹{stats.commission}
                </p>

              </div>

              {/* ACTIONS */}
              <div className="space-y-2">

                {/* TOGGLE */}
                <button
                  disabled={loading}
                  onClick={() => toggleSeller(s.id, s.active)}
                  className={`w-full py-2 rounded-xl font-semibold ${
                    s.active
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
                >
                  {s.active ? "Block Seller" : "Activate Seller"}
                </button>

                {/* PAYOUT */}
                <button
                  onClick={() => markPaid(s.id, stats.commission)}
                  className="w-full py-2 rounded-xl bg-blue-500 font-semibold"
                >
                  Pay ₹{stats.commission}
                </button>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

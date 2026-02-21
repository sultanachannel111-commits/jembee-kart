"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const productsSnap = await getDocs(collection(db, "products"));
        const ordersSnap = await getDocs(collection(db, "orders"));
        const usersSnap = await getDocs(collection(db, "users"));

        let totalRevenue = 0;

        ordersSnap.forEach((doc) => {
          const data = doc.data();
          if (data.totalAmount) {
            totalRevenue += data.totalAmount;
          }
        });

        setStats({
          products: productsSnap.size,
          orders: ordersSnap.size,
          users: usersSnap.size,
          revenue: totalRevenue,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6 animate-fadeIn">
      <h1 className="text-3xl font-bold mb-8 text-brand-pink">
        Admin Dashboard
      </h1>

      <div className="grid md:grid-cols-4 gap-6">

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Total Products</p>
              <h2 className="text-2xl font-bold mt-2">
                {stats.products}
              </h2>
            </div>
            <Package className="text-brand-pink" size={28} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Total Orders</p>
              <h2 className="text-2xl font-bold mt-2">
                {stats.orders}
              </h2>
            </div>
            <ShoppingCart className="text-brand-pink" size={28} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Total Users</p>
              <h2 className="text-2xl font-bold mt-2">
                {stats.users}
              </h2>
            </div>
            <Users className="text-brand-pink" size={28} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Total Revenue</p>
              <h2 className="text-2xl font-bold mt-2">
                ₹ {stats.revenue}
              </h2>
            </div>
            <DollarSign className="text-brand-pink" size={28} />
          </div>
        </div>

      </div>
    </div>
  );
}

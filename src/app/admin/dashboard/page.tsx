"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AnalyticsChart from "@/components/AnalyticsChart";

export default function AdminDashboard() {

  const [orders, setOrders] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const querySnapshot = await getDocs(collection(db, "orders"));

    const orderData: any[] = [];
    let revenue = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orderData.push(data);
      revenue += data.price;
    });

    setOrders(orderData);
    setTotalRevenue(revenue);
  };

  const monthlyRevenue = orders.reduce((acc, order) => {
    const month = new Date(order.date.seconds * 1000).getMonth();
    acc[month] = (acc[month] || 0) + order.price;
    return acc;
  }, {} as any);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">
        JEMBEE KART Admin
      </h1>

      <div className="grid md:grid-cols-3 gap-6 mb-6">

        <div className="bg-white p-4 rounded-xl shadow">
          Total Orders: {orders.length}
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          Total Revenue: ₹{totalRevenue}
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          This Month: ₹{monthlyRevenue[new Date().getMonth()] || 0}
        </div>

      </div>

      <AnalyticsChart revenueData={monthlyRevenue} />

    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function DashboardPage() {
  const [orders, setOrders] = useState(0);
  const [products, setProducts] = useState(0);
  const [users, setUsers] = useState(0);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const orderSnap = await getDocs(collection(db, "orders"));
    const productSnap = await getDocs(collection(db, "products"));
    const userSnap = await getDocs(collection(db, "users"));

    let totalRevenue = 0;

    orderSnap.forEach((doc) => {
      const data = doc.data();
      totalRevenue += data.price || 0;
    });

    setOrders(orderSnap.size);
    setProducts(productSnap.size);
    setUsers(userSnap.size);
    setRevenue(totalRevenue);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Dashboard Overview 📊
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        <Card title="Total Orders" value={orders} />
        <Card title="Total Revenue" value={`₹${revenue}`} />
        <Card title="Total Products" value={products} />
        <Card title="Total Users" value={users} />

      </div>
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

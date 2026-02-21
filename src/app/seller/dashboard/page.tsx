"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SellerDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState(0);
  const [products, setProducts] = useState(0);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    fetchSellerData();
  }, [user]);

  const fetchSellerData = async () => {
    if (!user) return;

    // Seller ke products
    const productQuery = query(
      collection(db, "products"),
      where("sellerId", "==", user.uid)
    );

    const productSnap = await getDocs(productQuery);

    // Seller ke orders
    const orderQuery = query(
      collection(db, "orders"),
      where("sellerId", "==", user.uid)
    );

    const orderSnap = await getDocs(orderQuery);

    let totalRevenue = 0;

    orderSnap.forEach((doc) => {
      const data = doc.data();
      totalRevenue += data.price || 0;
    });

    setProducts(productSnap.size);
    setOrders(orderSnap.size);
    setRevenue(totalRevenue);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <h1 className="text-3xl font-bold mb-8">
        Seller Dashboard 🛍
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

        <Card title="Your Products" value={products} />
        <Card title="Your Orders" value={orders} />
        <Card title="Your Revenue" value={`₹${revenue}`} />

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

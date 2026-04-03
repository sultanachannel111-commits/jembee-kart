"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

import {
  Package,
  ShoppingCart,
  Users,
  Store,
  Tag,
  Image,
  Truck,
  Settings,
  DollarSign,
  Palette,
  Home
} from "lucide-react";

export default function AdminDashboard() {

  const [stats, setStats] = useState({
    orders: 0,
    users: 0,
    revenue: 0
  });

  /* 🔥 LOAD STATS */
  useEffect(() => {

    const loadStats = async () => {

      const orderSnap = await getDocs(collection(db, "orders"));
      const userSnap = await getDocs(collection(db, "users"));

      let revenue = 0;

      orderSnap.forEach(d => {
        revenue += d.data().total || 0;
      });

      setStats({
        orders: orderSnap.size,
        users: userSnap.size,
        revenue
      });

    };

    loadStats();

  }, []);

  return (

    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-200 via-pink-100 to-white">

      {/* 🔥 HEADER */}
      <h1 className="text-3xl font-bold mb-6">
        🚀 JembeeKart Admin
      </h1>

      {/* 🔥 STATS */}
      <div className="grid grid-cols-3 gap-4 mb-8">

        <div className="glass p-4 text-center">
          <ShoppingCart className="mx-auto mb-2 text-purple-600"/>
          <p className="text-lg font-bold">{stats.orders}</p>
          <p className="text-xs text-gray-500">Orders</p>
        </div>

        <div className="glass p-4 text-center">
          <Users className="mx-auto mb-2 text-blue-600"/>
          <p className="text-lg font-bold">{stats.users}</p>
          <p className="text-xs text-gray-500">Users</p>
        </div>

        <div className="glass p-4 text-center">
          <DollarSign className="mx-auto mb-2 text-green-600"/>
          <p className="text-lg font-bold">₹{stats.revenue}</p>
          <p className="text-xs text-gray-500">Revenue</p>
        </div>

      </div>

      {/* ================== ECOMMERCE ================== */}

      <h2 className="font-bold mb-3 text-lg">🛒 Ecommerce</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

        <Card href="/admin/products" icon={<Package/>} title="Products"/>
        <Card href="/admin/orders" icon={<ShoppingCart/>} title="Orders"/>
        <Card href="/admin/users" icon={<Users/>} title="Users"/>
        <Card href="/admin/sellers" icon={<Store/>} title="Sellers"/>

      </div>

      {/* ================== STORE ================== */}

      <h2 className="font-bold mb-3 text-lg">🏪 Store</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

        <Card href="/admin/categories" icon={<Tag/>} title="Categories"/>
        <Card href="/admin/banners" icon={<Image/>} title="Banners"/>
        <Card href="/admin/homepage" icon={<Home/>} title="Homepage"/>
        <Card href="/admin/shipping" icon={<Truck/>} title="Shipping"/>

      </div>

      {/* ================== MARKETING ================== */}

      <h2 className="font-bold mb-3 text-lg">🔥 Marketing</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

        <Card href="/admin/offers" icon={<Tag/>} title="Offers"/>
        <Card href="/admin/flash-sale" icon={<Tag/>} title="Flash Sale"/>
        <Card href="/admin/festival" icon={<Tag/>} title="Festival"/>

      </div>

      {/* ================== SYSTEM ================== */}

      <h2 className="font-bold mb-3 text-lg">⚙️ System</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <Card href="/admin/settings" icon={<Settings/>} title="Settings"/>
        <Card href="/admin/theme" icon={<Palette/>} title="Theme"/>
        <Card href="/admin/payments" icon={<DollarSign/>} title="Payments"/>

      </div>

    </div>
  );
}


/* 🔥 CARD COMPONENT */
function Card({ href, icon, title }) {
  return (
    <Link href={href}>
      <div className="glass p-4 rounded-xl text-center hover:scale-105 transition cursor-pointer">

        <div className="text-purple-600 mb-2 flex justify-center">
          {icon}
        </div>

        <p className="font-semibold">{title}</p>

      </div>
    </Link>
  );
}

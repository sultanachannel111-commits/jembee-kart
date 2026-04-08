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

        <StatCard icon={<ShoppingCart/>} value={stats.orders} label="Orders"/>
        <StatCard icon={<Users/>} value={stats.users} label="Users"/>
        <StatCard icon={<DollarSign/>} value={`₹${stats.revenue}`} label="Revenue"/>

      </div>

      {/* ================== ECOMMERCE ================== */}

      <Section title="🛒 Ecommerce">
        
        <Card 
  href="/admin/qikink-products" 
  icon={<Package/>} 
  title="Qikink Products" 
/>
        <Card href="/admin/products" icon={<Package/>} title="Products"/>
        <Card href="/admin/orders" icon={<ShoppingCart/>} title="Orders"/>
        <Card href="/admin/users" icon={<Users/>} title="Users"/>
        <Card href="/admin/sellers" icon={<Store/>} title="Sellers"/>
        <Card href="/admin/returns" icon={<Tag/>} title="Returns"/>

      </Section>

      {/* ================== STORE ================== */}

      <Section title="🏪 Store">

        <Card href="/admin/categories" icon={<Tag/>} title="Categories"/>
        <Card href="/admin/banners" icon={<Image/>} title="Banners"/>
        <Card href="/admin/homepage" icon={<Home/>} title="Homepage"/>
        <Card href="/admin/shipping" icon={<Truck/>} title="Shipping"/>
        <Card href="/admin/image-gallery" icon={<Image/>} title="Gallery"/>
        <Card href="/admin/upload-image" icon={<Image/>} title="Upload Image"/>

      </Section>

      {/* ================== MARKETING ================== */}

      <Section title="🔥 Marketing">

        <Card href="/admin/offers" icon={<Tag/>} title="Offers"/>
        <Card href="/admin/flash-sale" icon={<Tag/>} title="Flash Sale"/>
        <Card href="/admin/festival" icon={<Tag/>} title="Festival"/>
        <Card href="/admin/ai-offers" icon={<Tag/>} title="AI Offers"/>

      </Section>

      {/* ================== SYSTEM ================== */}

      <Section title="⚙️ System">

        <Card href="/admin/settings" icon={<Settings/>} title="Settings"/>
        <Card href="/admin/theme" icon={<Palette/>} title="Theme"/>
        <Card href="/admin/payments" icon={<DollarSign/>} title="Payments"/>
        <Card href="/admin/database" icon={<Store/>} title="Database"/>
        <Card href="/admin/debug" icon={<Settings/>} title="Debug"/>
        <Card href="/admin/diagnostics" icon={<Settings/>} title="Diagnostics"/>
        <Card href="/admin/errors" icon={<Settings/>} title="Errors"/>
        <Card href="/admin/runtime-check" icon={<Settings/>} title="Runtime Check"/>
        <Card href="/admin/runtime-monitor" icon={<Settings/>} title="Runtime Monitor"/>
        <Card href="/admin/system" icon={<Settings/>} title="System"/>
        <Card href="/admin/speed-optimizer" icon={<Settings/>} title="Speed Optimizer"/>
        <Card href="/admin/monitor" icon={<Settings/>} title="Monitor"/>
        <Card href="/admin/search-monitor" icon={<Settings/>} title="Search Monitor"/>
        <Card href="/admin/notifications" icon={<Settings/>} title="Notifications"/>
        <Card href="/admin/project-scanner" icon={<Settings/>} title="Project Scanner"/>
        <Card href="/admin/auto-fix" icon={<Settings/>} title="Auto Fix"/>
        <Card href="/admin/fix-variation" icon={<Settings/>} title="Fix Variation"/>

      </Section>

    </div>
  );
}


/* 🔥 SECTION WRAPPER */
function Section({ title, children }) {
  return (
    <>
      <h2 className="font-bold mb-3 text-lg">{title}</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {children}
      </div>
    </>
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


/* 🔥 STATS CARD */
function StatCard({ icon, value, label }) {
  return (
    <div className="glass p-4 text-center rounded-xl">
      <div className="mx-auto mb-2 text-purple-600 flex justify-center">
        {icon}
      </div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

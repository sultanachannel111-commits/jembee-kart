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
  Image as ImageIcon,
  Truck,
  Settings,
  DollarSign,
  Palette,
  Home,
  Activity,
  Zap,
  Bell,
  Search,
  Wrench
} from "lucide-react";

export default function AdminDashboard() {

  const [stats, setStats] = useState({
    orders: 0,
    users: 0,
    revenue: 0
  });

  /* 🔥 LOAD STATS FROM FIREBASE */
  useEffect(() => {
    const loadStats = async () => {
      try {
        const orderSnap = await getDocs(collection(db, "orders"));
        const userSnap = await getDocs(collection(db, "users"));

        let revenue = 0;
        orderSnap.forEach(d => {
          // Cashfree ya COD se jo total amount aaya hai use add kar rahe hain
          revenue += Number(d.data().total) || 0;
        });

        setStats({
          orders: orderSnap.size,
          users: userSnap.size,
          revenue: Math.round(revenue) // Clean revenue display
        });
      } catch (err) {
        console.error("Dashboard Stats Error:", err);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-200 via-pink-100 to-white pb-20">

      {/* 🔥 HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black italic tracking-tighter text-slate-900">
          🚀 JEMBEE<span className="text-purple-600">KART</span> ADMIN
        </h1>
        <div className="bg-white/50 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-purple-700 border border-purple-200">
          📍 Jamshedpur HQ
        </div>
      </div>

      {/* 🔥 STATS OVERVIEW */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard icon={<ShoppingCart size={20}/>} value={stats.orders} label="Orders"/>
        <StatCard icon={<Users size={20}/>} value={stats.users} label="Users"/>
        <StatCard icon={<DollarSign size={20}/>} value={`₹${stats.revenue.toLocaleString()}`} label="Revenue"/>
      </div>

      {/* ================== ECOMMERCE ================== */}
      <Section title="🛒 Ecommerce Management">
        <Card href="/admin/qikink-products" icon={<Zap/>} title="Qikink Sync" />
        <Card href="/admin/products" icon={<Package/>} title="Products"/>
        <Card href="/admin/orders" icon={<ShoppingCart/>} title="Orders"/>
        <Card href="/admin/users" icon={<Users/>} title="Users"/>
        <Card href="/admin/sellers" icon={<Store/>} title="Sellers"/>
        <Card href="/admin/returns" icon={<Tag/>} title="Returns"/>
      </Section>

      {/* ================== STORE CUSTOMIZATION ================== */}
      <Section title="🏪 Store Front">
        <Card href="/admin/categories" icon={<Tag/>} title="Categories"/>
        <Card href="/admin/banners" icon={<ImageIcon/>} title="Banners"/>
        <Card href="/admin/homepage" icon={<Home/>} title="Homepage"/>
        <Card href="/admin/shipping" icon={<Truck/>} title="Shipping"/>
        <Card href="/admin/image-gallery" icon={<ImageIcon/>} title="Gallery"/>
        <Card href="/admin/upload-image" icon={<ImageIcon/>} title="Upload"/>
      </Section>

      {/* ================== MARKETING & SALES ================== */}
      <Section title="🔥 Marketing & Growth">
        <Card href="/admin/offers" icon={<Tag/>} title="Offers"/>
        <Card href="/admin/flash-sale" icon={<Zap/>} title="Flash Sale"/>
        <Card href="/admin/festival" icon={<Palette/>} title="Festival Mode"/>
        <Card href="/admin/ai-offers" icon={<Activity/>} title="AI Offers"/>
      </Section>

      {/* ================== SYSTEM UTILITIES ================== */}
      <Section title="⚙️ System & Dev Tools">
        <Card href="/admin/settings" icon={<Settings/>} title="Settings"/>
        <Card href="/admin/theme" icon={<Palette/>} title="Theme"/>
        <Card href="/admin/payments" icon={<DollarSign/>} title="Payments"/>
        <Card href="/admin/notifications" icon={<Bell/>} title="Alerts"/>
        <Card href="/admin/search-monitor" icon={<Search/>} title="Search Log"/>
        <Card href="/admin/auto-fix" icon={<Wrench/>} title="Auto Fix"/>
      </Section>

    </div>
  );
}

/* 🔥 SECTION WRAPPER */
function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="font-black text-slate-800 mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
        <div className="h-1 w-6 bg-purple-600 rounded-full"></div>
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {children}
      </div>
    </div>
  );
}

/* 🔥 CARD COMPONENT */
function Card({ href, icon, title }: { href: string, icon: any, title: string }) {
  return (
    <Link href={href}>
      <div className="bg-white/60 backdrop-blur-md p-4 rounded-[24px] border border-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
        <div className="text-purple-600 mb-2 flex justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <p className="font-bold text-[11px] text-slate-700 uppercase tracking-tighter leading-tight">{title}</p>
      </div>
    </Link>
  );
}

/* 🔥 STATS CARD */
function StatCard({ icon, value, label }: { icon: any, value: any, label: string }) {
  return (
    <div className="bg-white/80 backdrop-blur-md p-5 text-center rounded-[32px] shadow-lg border border-white/50">
      <div className="mx-auto mb-2 text-purple-600 flex justify-center bg-purple-100 w-10 h-10 items-center rounded-2xl">
        {icon}
      </div>
      <p className="text-xl font-black text-slate-900 tracking-tighter">{value}</p>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  );
}

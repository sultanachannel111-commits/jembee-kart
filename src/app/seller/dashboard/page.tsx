"use client";

import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  Wallet,
  BadgeCheck,
  Star,
  BarChart3,
  MessageCircle,
  Megaphone,
  Tag,
  Bell,
  User,
  Settings,
  Trophy
} from "lucide-react";

export default function SellerDashboard() {

  const router = useRouter();

  const cards = [
    { title: "Dashboard", icon: <LayoutDashboard />, path: "/seller/dashboard" },
    { title: "Add Product", icon: <Package />, path: "/seller/add-product" },
    { title: "All Products", icon: <Package />, path: "/seller/products" },
    { title: "Orders", icon: <ShoppingCart />, path: "/seller/orders" },
    { title: "Inventory", icon: <Package />, path: "/seller/inventory" },
    { title: "Earnings", icon: <DollarSign />, path: "/seller/earnings" },
    { title: "Withdraw", icon: <Wallet />, path: "/seller/withdraw" },
    { title: "KYC", icon: <BadgeCheck />, path: "/seller/kyc" },
    { title: "Reviews", icon: <Star />, path: "/seller/reviews" },
    { title: "Analytics", icon: <BarChart3 />, path: "/seller/analytics" },
    { title: "Messages", icon: <MessageCircle />, path: "/seller/messages" },
    { title: "Promotions", icon: <Megaphone />, path: "/seller/promotions" },
    { title: "Coupons", icon: <Tag />, path: "/seller/coupons" },
    { title: "Notifications", icon: <Bell />, path: "/seller/notifications" },
    { title: "Profile", icon: <User />, path: "/seller/profile" },
    { title: "Settings", icon: <Settings />, path: "/seller/settings" },
    { title: "Ranking", icon: <Trophy />, path: "/seller/ranking" },
  ];

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-purple-200 via-pink-100 to-white">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-4">
        Seller Dashboard 🚀
      </h1>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="glass p-3 rounded-xl text-center">
          <p className="text-sm">Orders</p>
          <p className="font-bold text-lg">0</p>
        </div>

        <div className="glass p-3 rounded-xl text-center">
          <p className="text-sm">Revenue</p>
          <p className="font-bold text-lg text-blue-600">₹0</p>
        </div>

        <div className="glass p-3 rounded-xl text-center">
          <p className="text-sm">Commission</p>
          <p className="font-bold text-lg text-green-600">₹0</p>
        </div>
      </div>

      {/* 🔥 MAIN GRID */}
      <div className="grid grid-cols-2 gap-4">

        {cards.map((c, i) => (
          <div
            key={i}
            onClick={() => router.push(c.path)}
            className="cursor-pointer p-4 rounded-2xl shadow-md 
                       backdrop-blur-lg bg-white/70 border hover:scale-105 transition"
          >

            <div className="text-pink-600 mb-2">
              {c.icon}
            </div>

            <p className="font-semibold text-sm">
              {c.title}
            </p>

          </div>
        ))}

      </div>

    </div>
  );
}

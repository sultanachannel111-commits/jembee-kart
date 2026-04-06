"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

export default function SellerDashboard() {

  const router = useRouter();

  // 🔥 STATES
  const [orders, setOrders] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [pending, setPending] = useState(0);
  const [available, setAvailable] = useState(0);

  useEffect(() => {

    const loadDashboard = async () => {

      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "orders"),
        where("sellerRef", "==", user.uid)
      );

      const snap = await getDocs(q);

      let totalRevenue = 0;
      let pendingAmount = 0;
      let availableAmount = 0;
      let totalOrders = 0;

      snap.forEach((doc) => {

        const data: any = doc.data();

        totalOrders++;

        const total = Number(data.total) || 0;
        const commission = Number(data.commission) || 0;

        // 🔥 STATUS NORMALIZE (IMPORTANT)
        const status = (data.orderStatus || data.status || "PENDING").toUpperCase();

        // ✅ TOTAL SALES (sirf display ke liye)
        totalRevenue += total;

        // ✅ SAME LOGIC AS EARNINGS PAGE
        if (status === "DELIVERED") {
          availableAmount += commission;
        } else {
          pendingAmount += commission;
        }

      });

      setOrders(totalOrders);
      setRevenue(totalRevenue);
      setPending(pendingAmount);
      setAvailable(availableAmount);

    };

    loadDashboard();

  }, []);

  // 🔥 CARDS
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

      {/* 🔥 STATS (FIXED) */}
      <div className="grid grid-cols-2 gap-3 mb-5">

        <div className="glass p-3 rounded-xl text-center">
          <p className="text-sm">Orders</p>
          <p className="font-bold text-lg">{orders}</p>
        </div>

        <div className="glass p-3 rounded-xl text-center">
          <p className="text-sm">Revenue</p>
          <p className="font-bold text-lg text-blue-600">₹{revenue}</p>
        </div>

        <div className="glass p-3 rounded-xl text-center">
          <p className="text-sm text-yellow-600">Pending Earnings ⏳</p>
          <p className="font-bold text-lg">₹{pending}</p>
        </div>

        <div className="glass p-3 rounded-xl text-center">
          <p className="text-sm text-green-600">Available Earnings 💸</p>
          <p className="font-bold text-lg">₹{available}</p>
        </div>

      </div>

      {/* 🔥 GRID */}
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

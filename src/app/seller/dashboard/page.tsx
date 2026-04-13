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
import { onAuthStateChanged } from "firebase/auth";
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
  const [loading, setLoading] = useState(true);

  // 🔥 LOAD DASHBOARD DATA
  useEffect(() => {
    // Auth state listener taaki page refresh par user null na mile
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadDashboard(user.uid);
      } else {
        router.push("/login");
      }
    });
    return () => unsub();
  }, []);

  const loadDashboard = async (uid: string) => {
    try {
      const q = query(
        collection(db, "orders"),
        where("sellerRef", "==", uid)
      );

      const snap = await getDocs(q);

      let totalOrders = 0;
      let totalRevenue = 0;
      let pendingAmount = 0;
      let availableAmount = 0;

      snap.forEach((doc) => {
        const data: any = doc.data();
        totalOrders++;

        // 💰 EARNINGS LOGIC (Synced with Earnings Page)
        const salePrice = Number(data.total) || 0;
        const basePrice = Number(data.basePrice) || 0;
        
        let commission = 0;
        if (data.commission !== undefined) {
          commission = Number(data.commission);
        } else {
          const profit = salePrice - basePrice;
          commission = profit > 0 ? profit * 0.50 : 0;
        }

        // 🔄 STATUS NORMALIZATION
        const status = (data.orderStatus || data.status || "PENDING").toUpperCase();

        // ✅ TOTAL SALES
        totalRevenue += salePrice;

        // ✅ SELLER EARNINGS DISTRIBUTION
        if (status === "DELIVERED") {
          availableAmount += commission;
        } else if (["PLACED", "PROCESSING", "SHIPPED", "PENDING"].includes(status)) {
          pendingAmount += commission;
        }
      });

      setOrders(totalOrders);
      setRevenue(totalRevenue);
      setPending(pendingAmount);
      setAvailable(availableAmount);
    } catch (err) {
      console.log("Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 CARDS (Unchanged)
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>;
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-purple-200 via-pink-100 to-white">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-4 uppercase tracking-tight">
        Seller Dashboard 🚀
      </h1>

      {/* 🔥 STATS */}
      <div className="grid grid-cols-2 gap-3 mb-5">

        {/* ORDERS */}
        <div className="glass p-3 rounded-xl text-center border border-white/20">
          <p className="text-xs uppercase font-bold text-slate-500">Orders</p>
          <p className="font-black text-xl">{orders}</p>
        </div>

        {/* REVENUE */}
        <div className="glass p-3 rounded-xl text-center border border-white/20">
          <p className="text-xs uppercase font-bold text-slate-500">Revenue</p>
          <p className="font-black text-xl text-blue-600">₹{revenue.toLocaleString()}</p>
        </div>

        {/* PENDING EARNINGS */}
        <div className="glass p-3 rounded-xl text-center border border-white/20">
          <p className="text-[10px] uppercase font-bold text-yellow-700">
            Pending ⏳
          </p>
          <p className="font-black text-xl text-yellow-600">
            ₹{pending.toLocaleString()}
          </p>
        </div>

        {/* AVAILABLE EARNINGS */}
        <div className="glass p-3 rounded-xl text-center border border-white/20">
          <p className="text-[10px] uppercase font-bold text-green-700">
            Available 💸
          </p>
          <p className="font-black text-xl text-green-600">
            ₹{available.toLocaleString()}
          </p>
        </div>

      </div>

      {/* 🔥 MAIN GRID */}
      <div className="grid grid-cols-2 gap-4 pb-20">

        {cards.map((c, i) => (
          <div
            key={i}
            onClick={() => router.push(c.path)}
            className="cursor-pointer p-4 rounded-2xl shadow-md 
                       backdrop-blur-lg bg-white/70 border border-white/40 hover:scale-105 active:scale-95 transition-all"
          >
            <div className="text-pink-600 mb-2">
              {c.icon}
            </div>

            <p className="font-bold text-xs uppercase tracking-tighter">
              {c.title}
            </p>

          </div>
        ))}

      </div>

    </div>
  );
}

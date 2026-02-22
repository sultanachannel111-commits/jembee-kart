"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Menu,
  X,
  LogOut,
  ShieldCheck,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        router.replace("/");
        return;
      }

      const userRole = userDoc.data().role;

      if (userRole !== "admin" && userRole !== "superadmin") {
        router.replace("/");
        return;
      }

      setRole(userRole);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    const auth = getAuth();
    await auth.signOut();
    router.push("/login");
  };

  const navItem = (href: string, label: string, Icon: any) => {
    const active = pathname === href;

    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
        ${
          active
            ? "bg-pink-600 text-white"
            : "text-gray-300 hover:bg-pink-500 hover:text-white"
        }`}
      >
        <Icon size={18} />
        {label}
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Checking Access...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-black text-white p-6 space-y-4">
        <h2 className="text-2xl font-bold text-pink-500">
          Jembee Admin
        </h2>

        <nav className="space-y-2 mt-6">
          {navItem("/admin", "Dashboard", LayoutDashboard)}
          {navItem("/admin/products", "Products", Package)}
          {navItem("/admin/orders", "Orders", ShoppingCart)}

          {/* 🔥 Only SuperAdmin Can See Users */}
          {role === "superadmin" &&
            navItem("/admin/users", "Manage Admins", ShieldCheck)}

          {navItem("/admin/categories", "Categories", Package)}
          {navItem("/admin/banners", "Banners", Package)}
          {navItem("/admin/festival", "Festival", Package)}
        </nav>

        <button
          onClick={logout}
          className="mt-10 flex items-center gap-2 text-red-400 hover:text-red-600"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

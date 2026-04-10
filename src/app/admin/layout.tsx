"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Store,
  Tag,
  Settings,
  Image as ImageIcon,
  Gift,
  LogOut,
  Menu
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();

  // 🔥 Login page par layout hide
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const logout = () => {
    // Firebase logout logic yahan add kar sakte hain
    window.location.href = "/auth";
  };

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Products", icon: Package, path: "/admin/products" },
    { name: "Categories", icon: Tag, path: "/admin/categories" },
    { name: "Orders", icon: ShoppingCart, path: "/admin/orders" },
    { name: "Banners", icon: ImageIcon, path: "/admin/banners" },
    { name: "Festival", icon: Gift, path: "/admin/festival" },
    { name: "Sellers", icon: Store, path: "/admin/sellers" },
    { name: "Users", icon: Users, path: "/admin/users" },
    { name: "Settings", icon: Settings, path: "/admin/settings" }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* --- SIDEBAR (Desktop) --- */}
      <aside className="w-72 bg-white shadow-xl hidden lg:flex flex-col sticky top-0 h-screen">

        <div className="p-8 border-b">
          <h1 className="text-2xl font-black italic tracking-tighter text-slate-900">
            JEMBEE<span className="text-purple-600">KART</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Admin Terminal
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menu.map((item, index) => {
            const Icon = item.icon;
            const active = pathname === item.path;

            return (
              <Link
                key={index}
                href={item.path}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group
                ${active 
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-200" 
                  : "text-slate-500 hover:bg-purple-50 hover:text-purple-600"}`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span className={`text-sm font-bold ${active ? "opacity-100" : "opacity-80"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-4 w-full p-4 rounded-2xl text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            Logout Account
          </button>
        </div>

      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* HEADER (Sticky) */}
        <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-30 p-4 flex justify-between items-center lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
             {/* Mobile Logo */}
             <h1 className="text-xl font-black italic tracking-tighter text-purple-600">JK</h1>
          </div>
          
          <h2 className="font-black text-slate-800 uppercase text-xs tracking-widest hidden sm:block">
            {menu.find(m => m.path === pathname)?.name || "Management"}
          </h2>

          <div className="flex items-center gap-4">
            <button
              onClick={logout}
              className="lg:hidden text-slate-400 p-2"
            >
              <LogOut size={20} />
            </button>
            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-black text-xs border-2 border-white shadow-sm">
              SA
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="p-4 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* MOBILE BOTTOM NAVIGATION (Quick Access) */}
        <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t flex justify-around p-3 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
           {menu.slice(0, 5).map((item, index) => {
             const Icon = item.icon;
             const active = pathname === item.path;
             return (
               <Link key={index} href={item.path} className={`p-2 rounded-xl ${active ? "text-purple-600 bg-purple-50" : "text-slate-400"}`}>
                 <Icon size={22} />
               </Link>
             );
           })}
        </nav>

      </div>
    </div>
  );
}

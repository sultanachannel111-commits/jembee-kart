"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import {
LayoutDashboard,
Package,
ShoppingCart,
Users,
Store,
Tag,
Settings,
Image,
Gift,
LogOut
} from "lucide-react";

import { removeAdminCookie } from "@/lib/cookieAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {

const pathname = usePathname();

/* LOGIN CHECK */

useEffect(()=>{

// login page par check mat karo
if(pathname === "/admin/login") return;

const cookies = document.cookie;

if(!cookies.includes("admin=true")){
window.location.href="/admin/login";
}

},[pathname]);

/* login page par sidebar hide */

if(pathname === "/admin/login"){
return children;
}

/* LOGOUT */

const logout = ()=>{

removeAdminCookie();

window.location.href="/admin/login";

};

return(

<div className="flex min-h-screen bg-gray-100">

{/* SIDEBAR */}

<div className="w-64 bg-white shadow-lg p-6">

<h1 className="text-2xl font-bold text-purple-600">
JembeeKart
</h1>

<button
onClick={logout}
className="text-red-500 mt-6"
>
Logout
</button>

</div>

{/* MAIN */}

<div className="flex-1 p-6">

{children}

</div>

</div>

);

}
